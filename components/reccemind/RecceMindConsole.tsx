"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import KmzTrackPicker from "@/components/reccemind/KmzTrackPicker";
import PacenoteEditor from "@/components/reccemind/PacenoteEditor";
import RecceMindDemo from "@/components/reccemind/RecceMindDemo";
import RecceMindMap from "@/components/reccemind/RecceMindMap";
import RecceMindReviewPanel from "@/components/reccemind/RecceMindReviewPanel";
import RoutePointPicker from "@/components/reccemind/RoutePointPicker";
import SpeedProfileChart from "@/components/reccemind/SpeedProfileChart";
import { useRecceMindDraft } from "@/components/reccemind/useRecceMindDraft";
import { buildRecceMindPrintDocument, rallyDistance } from "@/app/lib/reccemind-print";
import type { RecceMindSavedStage } from "@/app/lib/reccemind-stage";
import {
  DEFAULT_RECCEMIND_THRESHOLDS,
  decodeGooglePolyline,
  formatDuration,
  type RecceMindAnalysis,
  type RecceMindCoordinate,
  type RecceMindThresholds,
} from "@/app/lib/reccemind";

type BackendStatus = "checking" | "online" | "offline";
type InputMode = "route" | "gpx" | "kmz" | "telemetry";
type AnalysisSourceType = InputMode | "gps";
type RouteEntryMode = "search" | "map";
type SaveState = "idle" | "saving" | "saved";

interface ApiErrorPayload {
  error?: string;
  detail?: string | { msg?: string }[];
}

interface RecceMindConsoleProps {
  initialStageId?: string | null;
}

function apiErrorMessage(payload: ApiErrorPayload, fallback: string) {
  if (payload.error) return payload.error;
  if (typeof payload.detail === "string") return payload.detail;
  if (Array.isArray(payload.detail)) {
    const messages = payload.detail.map((item) => item.msg).filter(Boolean);
    if (messages.length) return messages.join(" ");
  }
  return fallback;
}

async function parseAnalysisResponse(response: Response) {
  const payload = (await response.json()) as RecceMindAnalysis & ApiErrorPayload;
  if (!response.ok) throw new Error(apiErrorMessage(payload, "RecceMind no ha podido analizar el tramo."));
  return payload;
}

function safeFileStem(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return normalized || "reccemind";
}

function downloadPacenotesCsv(result: RecceMindAnalysis, stageName: string) {
  const rows = ["distancia_m,tipo,nota"];
  for (const note of result.pacenotes) {
    const escaped = `"${note.text.replaceAll('"', '""')}"`;
    rows.push(`${Math.round(note.distance)},${note.type},${escaped}`);
  }
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeFileStem(stageName)}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function printPacenotes(result: RecceMindAnalysis, driverId: string, stageName: string) {
  const popup = window.open("", "_blank");
  if (!popup) return false;
  popup.document.open();
  popup.document.write(buildRecceMindPrintDocument(result, { driverId, stageName }));
  popup.document.close();
  popup.focus();
  return true;
}

function copilotingPhrases(result: RecceMindAnalysis) {
  const phrases: string[] = [];
  for (let index = 0; index < result.pacenotes.length; index += 1) {
    const note = result.pacenotes[index];
    if (note.type === "distance") continue;
    const next = result.pacenotes[index + 1];
    const distanceAfter = next?.type === "distance" ? rallyDistance(next.text) : null;
    phrases.push(distanceAfter ? `${note.text}, ${distanceAfter}` : note.text);
  }
  return phrases;
}

function fileStem(file: File | null) {
  return file?.name.replace(/\.[^.]+$/, "") ?? "";
}

function formatSavedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isInputMode(value: string | null | undefined): value is InputMode {
  return value === "route" || value === "gpx" || value === "kmz" || value === "telemetry";
}

function isSourceType(value: string | null | undefined): value is AnalysisSourceType {
  return isInputMode(value) || value === "gps";
}

export default function RecceMindConsole({ initialStageId = null }: RecceMindConsoleProps) {
  const router = useRouter();
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const [mode, setMode] = useState<InputMode>("route");
  const [sourceType, setSourceType] = useState<AnalysisSourceType>("route");
  const [routeEntryMode, setRouteEntryMode] = useState<RouteEntryMode>("search");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originPoint, setOriginPoint] = useState<RecceMindCoordinate | null>(null);
  const [destinationPoint, setDestinationPoint] = useState<RecceMindCoordinate | null>(null);
  const [driverId, setDriverId] = useState("tramassso-admin");
  const [stageName, setStageName] = useState("");
  const [stageNameEdited, setStageNameEdited] = useState(false);
  const [stageId, setStageId] = useState<string | null>(initialStageId);
  const [stageLoading, setStageLoading] = useState(Boolean(initialStageId));
  const [stageDirty, setStageDirty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [thresholds, setThresholds] = useState<RecceMindThresholds>(DEFAULT_RECCEMIND_THRESHOLDS);
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [kmzFile, setKmzFile] = useState<File | null>(null);
  const [selectedKmzTrackIndex, setSelectedKmzTrackIndex] = useState<number | null>(null);
  const [telemetryFile, setTelemetryFile] = useState<File | null>(null);
  const [result, setResult] = useState<RecceMindAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurveIndex, setSelectedCurveIndex] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [recceActive, setRecceActive] = useState(false);
  const [recceCoordinates, setRecceCoordinates] = useState<RecceMindCoordinate[]>([]);
  const recceWatchRef = useRef<number | null>(null);
  const { recoverableDraft, lastSavedAt, discardDraft } = useRecceMindDraft(result, stageName, driverId);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/reccemind/health", { cache: "no-store" })
      .then((response) => { if (!cancelled) setBackendStatus(response.ok ? "online" : "offline"); })
      .catch(() => { if (!cancelled) setBackendStatus("offline"); });
    return () => {
      cancelled = true;
      if (recceWatchRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(recceWatchRef.current);
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (!initialStageId) return;
    let cancelled = false;
    setStageLoading(true);
    fetch(`/api/reccemind/stages/${encodeURIComponent(initialStageId)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { stage?: RecceMindSavedStage; error?: string };
        if (!response.ok || !payload.stage) throw new Error(payload.error || "No se pudo cargar el tramo guardado.");
        if (cancelled) return;
        const stage = payload.stage;
        setStageId(stage.id);
        setStageName(stage.name);
        setStageNameEdited(true);
        setDriverId(stage.driverId);
        setThresholds(stage.thresholds);
        setResult(stage.analysis);
        setSourceType(isSourceType(stage.sourceType) ? stage.sourceType : "route");
        if (isInputMode(stage.sourceType)) setMode(stage.sourceType);
        setSelectedCurveIndex(null);
        setStageDirty(false);
        setSaveState("saved");
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el tramo guardado.");
      })
      .finally(() => { if (!cancelled) setStageLoading(false); });
    return () => { cancelled = true; };
  }, [initialStageId]);

  const coordinates = result?.polyline ? decodeGooglePolyline(result.polyline) : [];
  const notes = result?.pacenotes.filter((note) => note.type === "note") ?? [];
  const estimatedDistanceMeters = result
    ? result.distanceMeters && result.distanceMeters > 0
      ? result.distanceMeters
      : Math.max(result.curves.at(-1)?.end_distance ?? 0, result.pacenotes.at(-1)?.distance ?? 0)
    : 0;

  const inferredInputStageName = () => {
    if (mode === "route" && routeEntryMode === "search" && origin.trim() && destination.trim()) {
      return `${origin.trim()} → ${destination.trim()}`;
    }
    if (mode === "route" && routeEntryMode === "map" && originPoint && destinationPoint) return "Tramo marcado en mapa";
    if (mode === "gpx" && gpxFile) return fileStem(gpxFile);
    if (mode === "kmz" && kmzFile) return fileStem(kmzFile);
    if (mode === "telemetry" && telemetryFile) return fileStem(telemetryFile);
    return "Tramo RecceMind";
  };

  const effectiveStageName = stageName.trim() || result?.sourceName || inferredInputStageName();

  const updateThreshold = (level: keyof RecceMindThresholds, value: string) => {
    const numeric = Number(value);
    setThresholds((current) => ({ ...current, [level]: Number.isFinite(numeric) && numeric > 0 ? numeric : current[level] }));
    setStageDirty(true);
  };

  const analyzeRoute = async () => {
    const payload = routeEntryMode === "map"
      ? (() => {
          if (!originPoint || !destinationPoint) throw new Error("Marca la salida y la meta en el mapa.");
          return {
            origin_coords: [originPoint.lat, originPoint.lng],
            destination_coords: [destinationPoint.lat, destinationPoint.lng],
          };
        })()
      : (() => {
          if (!origin.trim() || !destination.trim()) throw new Error("Indica un origen y un destino.");
          return { origin: origin.trim(), destination: destination.trim() };
        })();

    return parseAnalysisResponse(await fetch("/api/reccemind/analyze-route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, driver_id: driverId.trim() || "tramassso-admin", thresholds }),
    }));
  };

  const analyzeGpx = async () => {
    if (!gpxFile) throw new Error("Selecciona un archivo GPX.");
    if (gpxFile.size > 10 * 1024 * 1024) throw new Error("El GPX no puede superar 10 MB.");
    return parseAnalysisResponse(await fetch("/api/reccemind/process-gpx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gpx_content: await gpxFile.text(), driver_id: driverId.trim() || "tramassso-admin", thresholds }),
    }));
  };

  const analyzeKmz = async () => {
    if (!kmzFile) throw new Error("Selecciona un archivo KMZ.");
    if (kmzFile.size > 10 * 1024 * 1024) throw new Error("El KMZ no puede superar 10 MB.");
    const formData = new FormData();
    formData.append("file", kmzFile);
    formData.append("driver_id", driverId.trim() || "tramassso-admin");
    formData.append("thresholds", JSON.stringify(thresholds));
    if (selectedKmzTrackIndex !== null) formData.append("track_index", String(selectedKmzTrackIndex));
    return parseAnalysisResponse(await fetch("/api/reccemind/process-kmz", { method: "POST", body: formData }));
  };

  const analyzeTelemetry = async () => {
    if (!telemetryFile) throw new Error("Selecciona un CSV de telemetría.");
    if (telemetryFile.size > 10 * 1024 * 1024) throw new Error("La telemetría no puede superar 10 MB.");
    const formData = new FormData();
    formData.append("file", telemetryFile);
    formData.append("driver_id", driverId.trim() || "tramassso-admin");
    formData.append("thresholds", JSON.stringify(thresholds));
    return parseAnalysisResponse(await fetch("/api/reccemind/process-telemetry", { method: "POST", body: formData }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setFeedbackMessage(null);
    setSelectedCurveIndex(null);
    setShowDemo(false);
    try {
      const nextResult = mode === "route"
        ? await analyzeRoute()
        : mode === "gpx"
          ? await analyzeGpx()
          : mode === "kmz"
            ? await analyzeKmz()
            : await analyzeTelemetry();
      setResult(nextResult);
      setSourceType(mode);
      setBackendStatus("online");
      setStageDirty(true);
      setSaveState("idle");
      if (!stageNameEdited) setStageName(nextResult.sourceName || inferredInputStageName());
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo analizar el tramo.");
    } finally {
      setLoading(false);
    }
  };

  const restoreDraft = () => {
    if (!recoverableDraft) return;
    setResult(recoverableDraft.result);
    setStageName(recoverableDraft.stageName);
    setStageNameEdited(true);
    setDriverId(recoverableDraft.driverId);
    setSelectedCurveIndex(null);
    setError(null);
    setStageDirty(true);
    setSaveState("idle");
    setFeedbackMessage("Borrador local recuperado.");
  };

  const toggleSimulation = () => {
    if (!result || !("speechSynthesis" in window)) return;
    if (isSimulating) {
      window.speechSynthesis.cancel();
      setIsSimulating(false);
      return;
    }
    const queue = copilotingPhrases(result);
    setIsSimulating(true);
    const speakNext = () => {
      const phrase = queue.shift();
      if (!phrase) {
        setIsSimulating(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = "es-ES";
      utterance.rate = 1.4;
      utterance.onend = speakNext;
      utterance.onerror = () => setIsSimulating(false);
      window.speechSynthesis.speak(utterance);
    };
    speakNext();
  };

  const saveStage = async () => {
    if (!result || saveState === "saving") return;
    setSaveState("saving");
    setError(null);
    try {
      const endpoint = stageId ? `/api/reccemind/stages/${encodeURIComponent(stageId)}` : "/api/reccemind/stages";
      const response = await fetch(endpoint, {
        method: stageId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: effectiveStageName,
          driverId: driverId.trim() || "default",
          sourceType,
          sourceName: result.sourceName ?? null,
          analysis: result,
          thresholds,
        }),
      });
      const payload = await response.json() as { stage?: { id: string }; error?: string };
      if (!response.ok || !payload.stage) throw new Error(payload.error || "No se pudo guardar el tramo.");
      const nextId = payload.stage.id;
      setStageId(nextId);
      setStageDirty(false);
      setSaveState("saved");
      setFeedbackMessage(stageId ? "Cambios guardados en Mis tramos." : "Tramo guardado en Mis tramos.");
      if (!stageId) router.replace(`/reccemind?stage=${encodeURIComponent(nextId)}`, { scroll: false });
    } catch (saveError) {
      setSaveState("idle");
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el tramo.");
    }
  };

  const teachCorrections = async () => {
    if (!result) return;
    const corrections = result.pacenotes.flatMap((note) => {
      if (note.curve_index === null || note.structured?.kind !== "curve") return [];
      const curve = result.curves[note.curve_index];
      if (!curve || note.structured.severity === curve.classification) return [];
      return [{ curve, userClassification: note.structured.severity }];
    });
    if (!corrections.length) {
      setFeedbackMessage("No hay cambios de grado pendientes de aprendizaje.");
      return;
    }
    setLoading(true);
    setFeedbackMessage(null);
    try {
      for (const correction of corrections) {
        const response = await fetch("/api/reccemind/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            radius: correction.curve.radius,
            heading_change: correction.curve.heading_change,
            length: correction.curve.length,
            original_classification: correction.curve.classification,
            user_classification: correction.userClassification,
            driver_id: driverId.trim() || "tramassso-admin",
          }),
        });
        if (!response.ok) throw new Error("No se pudo guardar una de las correcciones.");
      }
      setFeedbackMessage(`${corrections.length} corrección${corrections.length === 1 ? "" : "es"} enviada${corrections.length === 1 ? "" : "s"} al perfil del piloto.`);
    } catch (feedbackError) {
      setFeedbackMessage(feedbackError instanceof Error ? feedbackError.message : "No se pudo guardar el aprendizaje.");
    } finally {
      setLoading(false);
    }
  };

  const startRecce = () => {
    if (!("geolocation" in navigator)) {
      setError("Este navegador no ofrece geolocalización.");
      return;
    }
    setError(null);
    setRecceCoordinates([]);
    setRecceActive(true);
    recceWatchRef.current = navigator.geolocation.watchPosition(
      (position) => setRecceCoordinates((current) => [...current, { lat: position.coords.latitude, lng: position.coords.longitude }]),
      (geoError) => {
        setError(`GPS: ${geoError.message}`);
        setRecceActive(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 },
    );
  };

  const stopRecce = async () => {
    if (recceWatchRef.current !== null) navigator.geolocation.clearWatch(recceWatchRef.current);
    recceWatchRef.current = null;
    setRecceActive(false);
    if (recceCoordinates.length < 3) {
      setError("El reconocimiento necesita al menos tres posiciones GPS.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const nextResult = await parseAnalysisResponse(await fetch("/api/reccemind/process-coords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coordinates: recceCoordinates.map((point) => [point.lat, point.lng]),
          driver_id: driverId.trim() || "tramassso-admin",
          thresholds,
        }),
      }));
      setResult(nextResult);
      setSourceType("gps");
      setSelectedCurveIndex(null);
      setStageDirty(true);
      setSaveState("idle");
      if (!stageNameEdited) setStageName("Reconocimiento GPS");
    } catch (recceError) {
      setError(recceError instanceof Error ? recceError.message : "No se pudo procesar el reconocimiento GPS.");
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = backendStatus === "online" ? "Motor online" : backendStatus === "offline" ? "Motor no disponible" : "Comprobando motor";
  const cloudStatus = stageId
    ? stageDirty
      ? "Cambios pendientes"
      : "Guardado en Mis tramos"
    : lastSavedAt
      ? `Borrador local · ${formatSavedAt(lastSavedAt)}`
      : "Autoguardado local activo";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.15),transparent_35%),rgba(9,9,11,0.92)] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.45em] text-rose-300/70">RecceMind</p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">Prepara, revisa y entrena tus tramos</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">Ruta por búsqueda o mapa, GPX, KMZ, telemetría, reconocimiento GPS, revisión inteligente, editor estructurado y simulación de copiloto.</p>
          </div>
          <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.24em] ${backendStatus === "online" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : backendStatus === "offline" ? "border-red-400/30 bg-red-400/10 text-red-200" : "border-zinc-700 bg-zinc-900 text-zinc-400"}`}>
            <span className={`h-2 w-2 rounded-full ${backendStatus === "online" ? "bg-emerald-300" : backendStatus === "offline" ? "bg-red-300" : "bg-zinc-500"}`} />
            {statusLabel}
          </div>
        </div>
      </section>

      {!result && recoverableDraft && !stageLoading ? (
        <section className="flex flex-col gap-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-amber-300/70">Borrador local disponible</p>
            <p className="mt-1 text-sm font-medium text-amber-50">{recoverableDraft.stageName || "Tramo RecceMind"}</p>
            <p className="mt-1 text-xs text-amber-200/60">Guardado {formatSavedAt(recoverableDraft.savedAt)} · {recoverableDraft.result.pacenotes.filter((note) => note.type === "note").length} notas</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={restoreDraft} className="rounded-xl bg-amber-200 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-black">Recuperar</button>
            <button type="button" onClick={discardDraft} className="rounded-xl border border-amber-300/20 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-amber-100/70">Descartar</button>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(22rem,0.72fr)_minmax(0,1.28fr)]">
        <form onSubmit={submit} className="space-y-5 rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5 sm:p-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Entrada</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Origen del tramo</h2>
          </div>

          <div className="grid grid-cols-4 gap-1.5 rounded-2xl border border-zinc-800 bg-black/30 p-1.5 text-[9px] uppercase tracking-[0.14em] sm:text-[10px]">
            {(["route", "gpx", "kmz", "telemetry"] as const).map((item) => (
              <button key={item} type="button" onClick={() => setMode(item)} className={`rounded-xl px-1 py-2.5 transition ${mode === item ? "bg-white text-black" : "text-zinc-500 hover:text-white"}`}>
                {item === "route" ? "Ruta" : item === "gpx" ? "GPX" : item === "kmz" ? "KMZ" : "CSV"}
              </button>
            ))}
          </div>

          {mode === "route" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-zinc-800 bg-black/20 p-1">
                <button type="button" onClick={() => setRouteEntryMode("search")} className={`rounded-lg px-3 py-2 text-[10px] uppercase tracking-[0.16em] ${routeEntryMode === "search" ? "bg-zinc-100 text-black" : "text-zinc-500"}`}>Buscar lugares</button>
                <button type="button" onClick={() => setRouteEntryMode("map")} className={`rounded-lg px-3 py-2 text-[10px] uppercase tracking-[0.16em] ${routeEntryMode === "map" ? "bg-zinc-100 text-black" : "text-zinc-500"}`}>Marcar en mapa</button>
              </div>
              {routeEntryMode === "search" ? (
                <div className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">Origen</span>
                    <input value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="Artenara, Gran Canaria" className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none focus:border-zinc-500" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">Destino</span>
                    <input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Tejeda, Gran Canaria" className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none focus:border-zinc-500" />
                  </label>
                </div>
              ) : (
                <RoutePointPicker origin={originPoint} destination={destinationPoint} onChange={(nextOrigin, nextDestination) => { setOriginPoint(nextOrigin); setDestinationPoint(nextDestination); }} />
              )}
            </div>
          ) : null}

          {mode === "gpx" ? (
            <FileInput
              label="Archivo GPX"
              accept=".gpx,application/gpx+xml,application/xml,text/xml"
              file={gpxFile}
              onChange={(file) => {
                setGpxFile(file);
                if (!stageNameEdited && file) setStageName(fileStem(file));
              }}
              hint="Importa un track GPX completo."
            />
          ) : null}

          {mode === "kmz" ? (
            <KmzTrackPicker
              file={kmzFile}
              selectedTrackIndex={selectedKmzTrackIndex}
              onFileChange={(file) => {
                setKmzFile(file);
                setSelectedKmzTrackIndex(null);
                if (!stageNameEdited) setStageName(file ? fileStem(file) : "");
              }}
              onTrackChange={(index, name) => {
                setSelectedKmzTrackIndex(index);
                if (!stageNameEdited && name) setStageName(name);
              }}
            />
          ) : null}

          {mode === "telemetry" ? (
            <FileInput
              label="Telemetría CSV"
              accept=".csv,text/csv"
              file={telemetryFile}
              onChange={(file) => {
                setTelemetryFile(file);
                if (!stageNameEdited && file) setStageName(fileStem(file));
              }}
              hint="lat, lon · opcionales speed, brake, gear."
            />
          ) : null}

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">Nombre del tramo</span>
            <input
              value={stageName}
              onChange={(event) => {
                setStageName(event.target.value);
                setStageNameEdited(true);
                setStageDirty(true);
              }}
              placeholder={result?.sourceName || inferredInputStageName()}
              maxLength={120}
              className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none focus:border-zinc-500"
            />
            <span className="text-[10px] leading-4 text-zinc-600">Se usa en la biblioteca, la cabecera, el PDF y el nombre del CSV.</span>
          </label>

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">Perfil / piloto</span>
            <input value={driverId} onChange={(event) => { setDriverId(event.target.value); setStageDirty(true); }} maxLength={100} className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none focus:border-zinc-500" />
          </label>

          <div className="rounded-2xl border border-zinc-800 bg-black/25 p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.24em] text-zinc-500">Umbrales de radio</p>
            <div className="grid grid-cols-5 gap-2">
              {(["6", "5", "4", "3", "2"] as const).map((level) => (
                <label key={level} className="grid gap-1">
                  <span className="text-center text-[9px] text-zinc-600">G{level}</span>
                  <input type="number" min={1} value={thresholds[level]} onChange={(event) => updateThreshold(level, event.target.value)} className="min-w-0 rounded-xl border border-zinc-800 bg-zinc-950 px-2 py-2 text-center text-sm text-white" />
                </label>
              ))}
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full rounded-2xl bg-white px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.28em] text-black disabled:opacity-50">
            {loading ? "Analizando..." : "Analizar tramo"}
          </button>
          <button type="button" disabled={loading} onClick={recceActive ? stopRecce : startRecce} className={`w-full rounded-2xl border px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.22em] transition ${recceActive ? "border-red-400/40 bg-red-400/15 text-red-100" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"}`}>
            {recceActive ? `Finalizar reconocimiento · ${recceCoordinates.length} puntos` : "Grabar reconocimiento GPS"}
          </button>
          {error ? <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-200">{error}</p> : null}
        </form>

        <div className="min-w-0 space-y-5">
          {stageLoading && !result ? (
            <div className="flex min-h-[38rem] items-center justify-center rounded-[2rem] border border-zinc-800 bg-zinc-950/70 text-xs uppercase tracking-[0.28em] text-zinc-600">Cargando tramo guardado</div>
          ) : result ? (
            <>
              <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.22em] text-zinc-600">Tramo actual</p>
                  <p className="mt-1 truncate text-sm font-semibold text-white">{effectiveStageName}</p>
                </div>
                <span className={`shrink-0 text-[10px] ${stageId && !stageDirty ? "text-emerald-300/70" : stageId ? "text-amber-300/70" : "text-zinc-500"}`}>{cloudStatus}</span>
              </div>

              {result.sourceName ? (
                <div className="rounded-2xl border border-sky-400/20 bg-sky-400/[0.07] px-4 py-3 text-sm text-sky-100">
                  <span className="font-semibold">Fuente: {result.sourceName}</span>
                  {result.kmzTrackCount && result.kmzTrackCount > 1 ? <span className="ml-2 text-sky-200/60">· {result.kmzTrackCount} trazados detectados.</span> : null}
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metric label="Distancia" value={estimatedDistanceMeters ? `${(estimatedDistanceMeters / 1000).toFixed(2)} km` : "—"} />
                <Metric label="Curvas" value={String(result.curves.length)} />
                <Metric label="Notas" value={String(notes.length)} />
                <Metric label="Duración" value={formatDuration(result.duration)} />
              </div>

              <RecceMindMap coordinates={coordinates} curves={result.curves} selectedCurveIndex={selectedCurveIndex} onSelectCurve={setSelectedCurveIndex} liveCoordinates={recceCoordinates} />

              <div className="flex flex-wrap gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3">
                <ActionButton label={showDemo ? "Cerrar modo demo" : "Modo demo"} onClick={() => setShowDemo((current) => !current)} />
                <ActionButton label={isSimulating ? "Detener audio" : "Reproducir audio"} onClick={toggleSimulation} />
                <ActionButton label={saveState === "saving" ? "Guardando..." : stageId ? stageDirty ? "Guardar cambios" : "Guardado" : "Guardar tramo"} onClick={() => void saveStage()} disabled={saveState === "saving" || Boolean(stageId && !stageDirty)} />
                <ActionButton label="Vista PDF" onClick={() => printPacenotes(result, driverId, effectiveStageName)} />
                <ActionButton label="Exportar CSV" onClick={() => downloadPacenotesCsv(result, effectiveStageName)} />
                <ActionButton label="Enseñar correcciones" onClick={teachCorrections} />
                {feedbackMessage ? <span className="self-center text-xs text-emerald-300">{feedbackMessage}</span> : null}
              </div>
              <p className="-mt-2 px-2 text-[11px] text-zinc-600">El modo demo anima el recorrido completo. La reproducción rápida conserva el modo de audio secuencial anterior.</p>

              {showDemo ? <RecceMindDemo key={`${result.polyline}-${effectiveStageName}`} result={result} coordinates={coordinates} /> : null}

              <RecceMindReviewPanel result={result} thresholds={thresholds} onSelectCurve={setSelectedCurveIndex} />

              <SpeedProfileChart speeds={result.speed_profile} />

              <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.15fr)_minmax(24rem,0.85fr)]">
                <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Pacenotes</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Editor estructurado</h2>
                    <p className="mt-2 text-xs leading-5 text-zinc-600">Dirección, grado, abre/cierra, longitud, cortar/no cortar, referencias de entorno y carretera. “Enseñar correcciones” sigue enviando únicamente cambios de grado al aprendizaje.</p>
                  </div>
                  <div className="mt-5 max-h-[52rem] overflow-y-auto pr-1">
                    <PacenoteEditor
                      pacenotes={result.pacenotes}
                      onChange={(pacenotes) => {
                        setResult((current) => current ? { ...current, pacenotes } : current);
                        setStageDirty(true);
                      }}
                    />
                  </div>
                </section>

                <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Geometría</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Curvas detectadas</h2>
                  <div className="mt-5 overflow-x-auto rounded-2xl border border-zinc-800">
                    <table className="min-w-[54rem] divide-y divide-zinc-800 text-sm">
                      <thead className="bg-zinc-900/70 text-left text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                        <tr><th className="px-4 py-3">Nota</th><th className="px-4 py-3">Radio</th><th className="px-4 py-3">Longitud</th><th className="px-4 py-3">Giro</th><th className="px-4 py-3">Conf.</th><th className="px-4 py-3">Posición</th></tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900 bg-black/20">
                        {result.curves.map((curve, index) => {
                          const entryClass = curve.entry_classification ?? curve.classification;
                          const exitClass = curve.exit_classification ?? curve.classification;
                          const hasTransition = Boolean(curve.modifier) && entryClass !== exitClass;
                          const profileRadius = curve.entry_radius && curve.exit_radius ? `${Math.round(curve.entry_radius)} → ${Math.round(curve.exit_radius)} m` : `${Math.round(curve.radius)} m`;
                          return (
                            <tr key={`${curve.start_idx}-${curve.end_idx}-${index}`} onClick={() => setSelectedCurveIndex(index)} className={`cursor-pointer transition hover:bg-white/5 ${selectedCurveIndex === index ? "bg-amber-400/10" : ""}`}>
                              <td className="px-4 py-3 font-medium text-white">{curve.direction} {hasTransition ? entryClass : curve.classification}{curve.modifier ?? ""}{hasTransition ? ` a ${exitClass}` : ""}</td>
                              <td className="px-4 py-3 text-zinc-400">{profileRadius}</td>
                              <td className="px-4 py-3 text-zinc-400">{Math.round(curve.length)} m</td>
                              <td className="px-4 py-3 text-zinc-400">{Math.round(Math.abs(curve.heading_change))}°</td>
                              <td className="px-4 py-3 text-zinc-400">{typeof curve.classification_confidence === "number" ? `${Math.round(curve.classification_confidence * 100)} %` : "—"}</td>
                              <td className="px-4 py-3 text-zinc-400">{Math.round(curve.start_distance)} m</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="flex min-h-[38rem] items-center justify-center rounded-[2rem] border border-dashed border-zinc-800 bg-white/[0.02] p-8 text-center">
              <div className="max-w-md">
                <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600">Sin análisis</p>
                <h2 className="mt-3 text-2xl font-semibold text-zinc-300">Carga o graba un tramo para empezar</h2>
                <p className="mt-3 text-sm leading-7 text-zinc-600">Busca lugares, marca salida/meta en mapa, importa GPX o KMZ, carga telemetría o graba un reconocimiento GPS.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function FileInput({ label, accept, file, onChange, hint }: { label: string; accept: string; file: File | null; onChange: (file: File | null) => void; hint: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">{label}</span>
      <input type="file" accept={accept} onChange={(event) => onChange(event.target.files?.[0] ?? null)} className="rounded-2xl border border-dashed border-zinc-700 bg-black/40 px-4 py-6 text-sm text-zinc-400" />
      <span className="text-xs leading-5 text-zinc-600">{file ? file.name : hint}</span>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4"><p className="text-[10px] uppercase tracking-[0.28em] text-zinc-600">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></div>;
}

function ActionButton({ label, onClick, disabled = false }: { label: string; onClick: () => void; disabled?: boolean }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="rounded-full border border-zinc-700 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-300 transition hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-35">{label}</button>;
}
