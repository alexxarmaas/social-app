"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import RouteMap from "@/components/routes/RouteMap";
import {
  DEFAULT_RECCEMIND_THRESHOLDS,
  decodeGooglePolyline,
  formatDuration,
  type RecceMindAnalysis,
  type RecceMindThresholds,
} from "@/app/lib/reccemind";

type BackendStatus = "checking" | "online" | "offline";
type InputMode = "route" | "gpx" | "telemetry";

interface ApiErrorPayload {
  error?: string;
  detail?: string | { msg?: string }[];
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
  if (!response.ok) {
    throw new Error(apiErrorMessage(payload, "RecceMind no ha podido analizar el tramo."));
  }
  return payload;
}

function downloadPacenotesCsv(result: RecceMindAnalysis) {
  const rows = ["distancia_m,tipo,nota"];
  for (const note of result.pacenotes) {
    const escaped = `"${note.text.replaceAll('"', '""')}"`;
    rows.push(`${Math.round(note.distance)},${note.type},${escaped}`);
  }
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `reccemind-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function RecceMindConsole() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const [mode, setMode] = useState<InputMode>("route");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [driverId, setDriverId] = useState("tramassso-admin");
  const [thresholds, setThresholds] = useState<RecceMindThresholds>(DEFAULT_RECCEMIND_THRESHOLDS);
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [telemetryFile, setTelemetryFile] = useState<File | null>(null);
  const [result, setResult] = useState<RecceMindAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/reccemind/health", { cache: "no-store" })
      .then((response) => {
        if (!cancelled) setBackendStatus(response.ok ? "online" : "offline");
      })
      .catch(() => {
        if (!cancelled) setBackendStatus("offline");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const coordinates = useMemo(
    () => (result?.polyline ? decodeGooglePolyline(result.polyline) : null),
    [result?.polyline],
  );

  const notes = useMemo(
    () => result?.pacenotes.filter((note) => note.type === "note") ?? [],
    [result],
  );

  const estimatedDistanceMeters = useMemo(() => {
    if (!result) return 0;
    if (result.distanceMeters && result.distanceMeters > 0) return result.distanceMeters;
    const lastCurve = result.curves.at(-1);
    const lastNote = result.pacenotes.at(-1);
    return Math.max(lastCurve?.end_distance ?? 0, lastNote?.distance ?? 0);
  }, [result]);

  const speedStats = useMemo(() => {
    if (!result?.speed_profile.length) return null;
    const kmh = result.speed_profile.map((speed) => speed * 3.6);
    return {
      min: Math.round(Math.min(...kmh)),
      max: Math.round(Math.max(...kmh)),
    };
  }, [result]);

  const updateThreshold = (level: keyof RecceMindThresholds, value: string) => {
    const numeric = Number(value);
    setThresholds((current) => ({
      ...current,
      [level]: Number.isFinite(numeric) && numeric > 0 ? numeric : current[level],
    }));
  };

  const analyzeRoute = async () => {
    if (!origin.trim() || !destination.trim()) {
      throw new Error("Indica un origen y un destino.");
    }
    const response = await fetch("/api/reccemind/analyze-route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: origin.trim(),
        destination: destination.trim(),
        driver_id: driverId.trim() || "tramassso-admin",
        thresholds,
      }),
    });
    return parseAnalysisResponse(response);
  };

  const analyzeGpx = async () => {
    if (!gpxFile) throw new Error("Selecciona un archivo GPX.");
    if (gpxFile.size > 10 * 1024 * 1024) throw new Error("El GPX no puede superar 10 MB.");
    const gpxContent = await gpxFile.text();
    const response = await fetch("/api/reccemind/process-gpx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gpx_content: gpxContent,
        driver_id: driverId.trim() || "tramassso-admin",
        thresholds,
      }),
    });
    return parseAnalysisResponse(response);
  };

  const analyzeTelemetry = async () => {
    if (!telemetryFile) throw new Error("Selecciona un CSV de telemetria.");
    if (telemetryFile.size > 10 * 1024 * 1024) throw new Error("La telemetria no puede superar 10 MB.");
    const formData = new FormData();
    formData.append("file", telemetryFile);
    formData.append("driver_id", driverId.trim() || "tramassso-admin");
    formData.append("thresholds", JSON.stringify(thresholds));
    const response = await fetch("/api/reccemind/process-telemetry", {
      method: "POST",
      body: formData,
    });
    return parseAnalysisResponse(response);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const nextResult = mode === "route"
        ? await analyzeRoute()
        : mode === "gpx"
          ? await analyzeGpx()
          : await analyzeTelemetry();
      setResult(nextResult);
      setBackendStatus("online");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo analizar el tramo.");
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = backendStatus === "online"
    ? "Motor online"
    : backendStatus === "offline"
      ? "Motor no disponible"
      : "Comprobando motor";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.15),transparent_35%),rgba(9,9,11,0.92)] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.45em] text-rose-300/70">RecceMind Cloud Console</p>
            <h1 className="mt-3 text-balance font-sans text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Prepara y revisa tramos desde Tramassso
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              Analiza rutas, GPX y telemetria con el motor geometrico de RecceMind sin exponer el servicio backend al navegador.
            </p>
          </div>
          <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.24em] ${backendStatus === "online" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : backendStatus === "offline" ? "border-red-400/30 bg-red-400/10 text-red-200" : "border-zinc-700 bg-zinc-900 text-zinc-400"}`}>
            <span className={`h-2 w-2 rounded-full ${backendStatus === "online" ? "bg-emerald-300" : backendStatus === "offline" ? "bg-red-300" : "bg-zinc-500"}`} />
            {statusLabel}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(22rem,0.72fr)_minmax(0,1.28fr)]">
        <form onSubmit={submit} className="space-y-5 rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5 sm:p-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Entrada</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Origen del tramo</h2>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-zinc-800 bg-black/30 p-1.5 text-[10px] uppercase tracking-[0.18em]">
            {(["route", "gpx", "telemetry"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-xl px-2 py-2.5 transition ${mode === item ? "bg-white text-black" : "text-zinc-500 hover:text-white"}`}
              >
                {item === "route" ? "Ruta" : item === "gpx" ? "GPX" : "CSV"}
              </button>
            ))}
          </div>

          {mode === "route" ? (
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">Origen</span>
                <input value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="Artenara, Gran Canaria" className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-zinc-500" />
              </label>
              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">Destino</span>
                <input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Tejeda, Gran Canaria" className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-zinc-500" />
              </label>
            </div>
          ) : null}

          {mode === "gpx" ? (
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">Archivo GPX</span>
              <input type="file" accept=".gpx,application/gpx+xml,application/xml,text/xml" onChange={(event) => setGpxFile(event.target.files?.[0] ?? null)} className="rounded-2xl border border-dashed border-zinc-700 bg-black/40 px-4 py-6 text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-semibold file:text-black" />
              {gpxFile ? <span className="text-xs text-zinc-500">{gpxFile.name}</span> : null}
            </label>
          ) : null}

          {mode === "telemetry" ? (
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">Telemetria CSV</span>
              <input type="file" accept=".csv,text/csv" onChange={(event) => setTelemetryFile(event.target.files?.[0] ?? null)} className="rounded-2xl border border-dashed border-zinc-700 bg-black/40 px-4 py-6 text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-semibold file:text-black" />
              <span className="text-xs leading-5 text-zinc-600">Columnas minimas: lat, lon. Opcionales: speed, brake, gear.</span>
            </label>
          ) : null}

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">Perfil / piloto</span>
            <input value={driverId} onChange={(event) => setDriverId(event.target.value)} maxLength={100} className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-zinc-500" />
          </label>

          <div className="rounded-2xl border border-zinc-800 bg-black/25 p-4">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Umbrales de radio</p>
              <p className="mt-1 text-xs text-zinc-600">Metros. La clase 1 queda por debajo del umbral de 2.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 xl:grid-cols-2 2xl:grid-cols-5">
              {(["6", "5", "4", "3", "2"] as const).map((level) => (
                <label key={level} className="grid gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">Grado {level}</span>
                  <input type="number" min={1} value={thresholds[level]} onChange={(event) => updateThreshold(level, event.target.value)} className="min-w-0 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500" />
                </label>
              ))}
            </div>
          </div>

          {error ? <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-200">{error}</p> : null}

          <button disabled={loading} type="submit" className="w-full rounded-2xl bg-white px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-zinc-200 disabled:cursor-wait disabled:opacity-50">
            {loading ? "Analizando..." : "Analizar tramo"}
          </button>
        </form>

        <div className="min-w-0 space-y-5">
          {result ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metric label="Distancia" value={estimatedDistanceMeters ? `${(estimatedDistanceMeters / 1000).toFixed(2)} km` : "—"} />
                <Metric label="Curvas" value={String(result.curves.length)} />
                <Metric label="Notas" value={String(notes.length)} />
                <Metric label="Duracion" value={formatDuration(result.duration)} />
              </div>

              <RouteMap coordinates={coordinates} />

              <div className="grid gap-5 2xl:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)]">
                <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Pacenotes</p>
                      <h2 className="mt-2 text-2xl font-semibold text-white">Borrador generado</h2>
                    </div>
                    <button type="button" onClick={() => downloadPacenotesCsv(result)} className="shrink-0 rounded-full border border-zinc-700 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-300 transition hover:border-white hover:text-white">
                      CSV
                    </button>
                  </div>
                  <div className="mt-5 max-h-[36rem] space-y-2 overflow-y-auto pr-1">
                    {result.pacenotes.map((note, index) => (
                      <div key={`${note.distance}-${index}`} className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${note.type === "distance" ? "border-zinc-800 bg-black/20" : "border-white/10 bg-white/[0.04]"}`}>
                        <span className="w-16 shrink-0 text-right font-mono text-xs text-zinc-600">{Math.round(note.distance)} m</span>
                        <span className={note.type === "distance" ? "text-xs uppercase tracking-[0.22em] text-zinc-500" : "text-sm font-medium text-zinc-100"}>
                          {note.type === "distance" ? `${note.text} m` : note.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Geometria</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Curvas detectadas</h2>
                    {speedStats ? <p className="mt-2 text-xs text-amber-200/70">Perfil teorico experimental: {speedStats.min}–{speedStats.max} km/h. No usar como instruccion de conduccion.</p> : null}
                  </div>
                  <div className="mt-5 overflow-x-auto rounded-2xl border border-zinc-800">
                    <table className="min-w-[42rem] divide-y divide-zinc-800 text-sm">
                      <thead className="bg-zinc-900/70 text-left text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                        <tr>
                          <th className="px-4 py-3">Nota</th>
                          <th className="px-4 py-3">Radio</th>
                          <th className="px-4 py-3">Longitud</th>
                          <th className="px-4 py-3">Giro</th>
                          <th className="px-4 py-3">Posicion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900 bg-black/20">
                        {result.curves.map((curve, index) => (
                          <tr key={`${curve.start_idx}-${curve.end_idx}-${index}`}>
                            <td className="px-4 py-3 font-medium text-white">{curve.direction} {curve.classification}{curve.modifier ?? ""}</td>
                            <td className="px-4 py-3 text-zinc-400">{Math.round(curve.radius)} m</td>
                            <td className="px-4 py-3 text-zinc-400">{Math.round(curve.length)} m</td>
                            <td className="px-4 py-3 text-zinc-400">{Math.round(Math.abs(curve.heading_change))}°</td>
                            <td className="px-4 py-3 text-zinc-400">{Math.round(curve.start_distance)} m</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="flex min-h-[38rem] items-center justify-center rounded-[2rem] border border-dashed border-zinc-800 bg-white/[0.02] p-8 text-center">
              <div className="max-w-md">
                <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600">Sin analisis</p>
                <h2 className="mt-3 text-2xl font-semibold text-zinc-300">Carga un tramo para empezar</h2>
                <p className="mt-3 text-sm leading-7 text-zinc-600">Puedes generar una ruta con Google, importar un GPX o analizar un CSV de telemetria. El resultado aparecera aqui con mapa, curvas y pacenotes.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
      <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-600">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
