"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import RecceMindMap from "@/components/reccemind/RecceMindMap";
import { rallyDistance } from "@/app/lib/reccemind-print";
import {
  clampCallAheadMeters,
  projectCoordinateOntoRoute,
  routeDistances,
  type RecceMindRouteProjection,
} from "@/app/lib/reccemind-geo";
import type { RecceMindAnalysis, RecceMindCoordinate } from "@/app/lib/reccemind";

const MAX_GPS_ACCURACY_M = 50;
const MAX_OFF_ROUTE_M = 60;

type LiveStatus = "waiting" | "ready" | "low_accuracy" | "off_route" | "reverse" | "error";

interface LiveSample {
  routeDistance: number;
  timestamp: number;
}

interface WakeLockSentinelLike {
  release: () => Promise<void>;
}

type NavigatorWithWakeLock = Navigator & {
  wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> };
};

function buildCalls(result: RecceMindAnalysis) {
  return result.pacenotes.flatMap((note, index) => {
    if (note.type === "distance") return [];
    const following = result.pacenotes[index + 1];
    const link = following?.type === "distance" ? rallyDistance(following.text) : null;
    const stableId = note.curve_index !== null
      ? `curve-${note.curve_index}-${Math.round(note.distance)}`
      : `manual-${Math.round(note.distance)}-${note.text}`;
    return [{
      id: stableId,
      note,
      phrase: link ? `${note.text}, ${link}` : note.text,
      link,
    }];
  });
}

function statusLabel(status: LiveStatus) {
  if (status === "ready") return "GPS listo";
  if (status === "low_accuracy") return "Precisión GPS baja";
  if (status === "off_route") return "Fuera del tramo";
  if (status === "reverse") return "Sentido contrario";
  if (status === "error") return "Error GPS";
  return "Esperando GPS";
}

export default function RecceMindLiveCopilot({ result, coordinates }: { result: RecceMindAnalysis; coordinates: RecceMindCoordinate[] }) {
  const cumulative = useMemo(() => routeDistances(coordinates), [coordinates]);
  const calls = useMemo(() => buildCalls(result), [result]);
  const [active, setActive] = useState(false);
  const [projection, setProjection] = useState<RecceMindRouteProjection | null>(null);
  const [rawPosition, setRawPosition] = useState<RecceMindCoordinate | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [speedMps, setSpeedMps] = useState<number | null>(null);
  const [leadSeconds, setLeadSeconds] = useState(4.5);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [status, setStatus] = useState<LiveStatus>("waiting");
  const [error, setError] = useState<string | null>(null);
  const [spokenIds, setSpokenIds] = useState<Set<string>>(() => new Set());
  const [lastSpokenPhrase, setLastSpokenPhrase] = useState<string | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const watchRef = useRef<number | null>(null);
  const callsRef = useRef(calls);
  const spokenRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const previousSampleRef = useRef<LiveSample | null>(null);
  const reverseSamplesRef = useRef(0);
  const matchedSegmentRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null);
  const leadSecondsRef = useRef(4.5);
  const voiceEnabledRef = useRef(true);

  const progress = projection?.routeDistance ?? 0;
  const callAhead = clampCallAheadMeters(speedMps, leadSeconds);
  const upcoming = calls.find((call) => !spokenIds.has(call.id) && call.note.distance >= progress - 20) ?? null;
  const upcomingIndex = upcoming ? calls.findIndex((call) => call.id === upcoming.id) : -1;
  const after = upcomingIndex >= 0 ? calls[upcomingIndex + 1] ?? null : null;
  const distanceToCall = upcoming ? Math.max(0, upcoming.note.distance - progress) : 0;
  const selectedCurveIndex = upcoming?.note.curve_index ?? null;

  useEffect(() => {
    callsRef.current = calls;
  }, [calls]);

  const speak = useCallback((phrase: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = "es-ES";
    utterance.rate = 1.3;
    setLastSpokenPhrase(phrase);
    window.speechSynthesis.speak(utterance);
  }, []);

  const requestWakeLock = useCallback(async () => {
    const wakeNavigator = navigator as NavigatorWithWakeLock;
    if (!wakeNavigator.wakeLock || document.visibilityState !== "visible") return;
    try {
      wakeLockRef.current = await wakeNavigator.wakeLock.request("screen");
      setWakeLockActive(true);
    } catch {
      setWakeLockActive(false);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    const current = wakeLockRef.current;
    wakeLockRef.current = null;
    setWakeLockActive(false);
    if (current) {
      try {
        await current.release();
      } catch {
        // Wake Lock is optional; GPS mode can continue without it.
      }
    }
  }, []);

  const stop = () => {
    if (watchRef.current !== null && "geolocation" in navigator) navigator.geolocation.clearWatch(watchRef.current);
    watchRef.current = null;
    window.speechSynthesis?.cancel();
    void releaseWakeLock();
    setActive(false);
    setStatus("waiting");
    previousSampleRef.current = null;
    reverseSamplesRef.current = 0;
    matchedSegmentRef.current = null;
    initializedRef.current = false;
  };

  useEffect(() => {
    const onVisibilityChange = () => {
      if (active && document.visibilityState === "visible" && !wakeLockRef.current) void requestWakeLock();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [active, requestWakeLock]);

  useEffect(() => () => {
    if (watchRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) navigator.geolocation.clearWatch(watchRef.current);
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    void releaseWakeLock();
  }, [releaseWakeLock]);

  const start = () => {
    if (active) {
      stop();
      return;
    }
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("Este dispositivo no ofrece geolocalización.");
      return;
    }
    if (coordinates.length < 2) {
      setError("El tramo no tiene geometría suficiente para el modo copiloto.");
      return;
    }

    const emptySpoken = new Set<string>();
    spokenRef.current = emptySpoken;
    setSpokenIds(emptySpoken);
    setLastSpokenPhrase(null);
    initializedRef.current = false;
    previousSampleRef.current = null;
    reverseSamplesRef.current = 0;
    matchedSegmentRef.current = null;
    setActive(true);
    setStatus("waiting");
    void requestWakeLock();

    watchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const raw = { lat: position.coords.latitude, lng: position.coords.longitude };
        const matched = projectCoordinateOntoRoute(raw, coordinates, cumulative, {
          preferredSegmentIndex: matchedSegmentRef.current,
          searchRadiusSegments: 180,
          reacquireAboveMeters: 100,
        });
        setRawPosition(raw);
        setAccuracy(position.coords.accuracy);
        setProjection(matched);
        if (!matched) {
          setStatus("off_route");
          return;
        }
        if (matched.offRouteMeters <= 100) matchedSegmentRef.current = matched.segmentIndex;

        const now = position.timestamp || Date.now();
        const previous = previousSampleRef.current;
        let derivedSpeed: number | null = null;
        if (previous && now > previous.timestamp) {
          const elapsed = (now - previous.timestamp) / 1000;
          if (elapsed > 0.2) derivedSpeed = Math.abs(matched.routeDistance - previous.routeDistance) / elapsed;
          const delta = matched.routeDistance - previous.routeDistance;
          if (delta < -8) reverseSamplesRef.current += 1;
          else if (delta > 4) reverseSamplesRef.current = Math.max(0, reverseSamplesRef.current - 1);
        }
        previousSampleRef.current = { routeDistance: matched.routeDistance, timestamp: now };

        const browserSpeed = typeof position.coords.speed === "number" && Number.isFinite(position.coords.speed) && position.coords.speed >= 0
          ? position.coords.speed
          : null;
        const currentSpeed = browserSpeed ?? derivedSpeed;
        setSpeedMps(currentSpeed);

        const latestCalls = callsRef.current;
        if (!initializedRef.current) {
          const initialSpoken = new Set(latestCalls.filter((call) => call.note.distance < matched.routeDistance - 30).map((call) => call.id));
          spokenRef.current = initialSpoken;
          setSpokenIds(initialSpoken);
          initializedRef.current = true;
        }

        let nextStatus: LiveStatus = "ready";
        if (position.coords.accuracy > MAX_GPS_ACCURACY_M) nextStatus = "low_accuracy";
        else if (matched.offRouteMeters > MAX_OFF_ROUTE_M) nextStatus = "off_route";
        else if (reverseSamplesRef.current >= 2) nextStatus = "reverse";
        setStatus(nextStatus);

        if (nextStatus !== "ready") return;
        const dynamicAhead = clampCallAheadMeters(currentSpeed, leadSecondsRef.current);
        const call = latestCalls.find((candidate) => !spokenRef.current.has(candidate.id) && candidate.note.distance >= matched.routeDistance - 20);
        if (!call) return;
        const distanceToNext = Math.max(0, call.note.distance - matched.routeDistance);
        if (distanceToNext > dynamicAhead) return;

        const nextSpoken = new Set(spokenRef.current);
        nextSpoken.add(call.id);
        spokenRef.current = nextSpoken;
        setSpokenIds(nextSpoken);
        if (voiceEnabledRef.current) speak(call.phrase);
      },
      (geoError) => {
        setStatus("error");
        setError(`GPS: ${geoError.message}`);
      },
      { enableHighAccuracy: true, maximumAge: 500, timeout: 12_000 },
    );
  };

  const rearmFromHere = () => {
    const next = new Set(calls.filter((call) => call.note.distance < progress - 20).map((call) => call.id));
    spokenRef.current = next;
    setSpokenIds(next);
    window.speechSynthesis?.cancel();
  };

  const skipUpcoming = () => {
    if (!upcoming) return;
    const next = new Set(spokenRef.current);
    next.add(upcoming.id);
    spokenRef.current = next;
    setSpokenIds(next);
    window.speechSynthesis?.cancel();
  };

  const repeatLast = () => {
    if (lastSpokenPhrase) speak(lastSpokenPhrase);
  };

  const toggleVoice = () => {
    setVoiceEnabled((current) => {
      const next = !current;
      voiceEnabledRef.current = next;
      if (!next) window.speechSynthesis?.cancel();
      return next;
    });
  };

  const changeLeadSeconds = (value: number) => {
    leadSecondsRef.current = value;
    setLeadSeconds(value);
  };

  const requestFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      // Fullscreen is optional; GPS mode continues without it.
    }
  };

  return (
    <section className="space-y-4 rounded-[2rem] border border-orange-400/20 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.14),transparent_34%),rgba(9,9,11,0.96)] p-4 sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] uppercase tracking-[0.4em] text-orange-300/70">Copiloto GPS beta</p>
            <span className={`h-2 w-2 rounded-full ${status === "ready" ? "bg-emerald-300" : active ? "bg-amber-300" : "bg-zinc-700"}`} />
            {wakeLockActive ? <span className="text-[8px] uppercase tracking-[0.14em] text-emerald-300/60">pantalla activa</span> : null}
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-white">Llamadas sobre posición real</h2>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-zinc-500">Map-matching con continuidad sobre el trazado, control de precisión, sentido de marcha y anticipación dinámica según velocidad. Úsalo primero en reconocimiento o entorno controlado.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={start} className={`rounded-xl px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${active ? "bg-red-400 text-black" : "bg-orange-300 text-black"}`}>{active ? "Detener GPS" : "Iniciar copiloto"}</button>
          <button type="button" onClick={toggleVoice} className={`rounded-xl border px-3 py-2.5 text-[10px] uppercase tracking-[0.14em] ${voiceEnabled ? "border-orange-300/30 bg-orange-300/10 text-orange-100" : "border-zinc-700 text-zinc-500"}`}>Voz {voiceEnabled ? "ON" : "OFF"}</button>
          <button type="button" onClick={() => void requestFullscreen()} className="rounded-xl border border-zinc-700 px-3 py-2.5 text-[10px] uppercase tracking-[0.14em] text-zinc-400">Pantalla completa</button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <RecceMindMap coordinates={coordinates} curves={result.curves} selectedCurveIndex={selectedCurveIndex} onSelectCurve={() => undefined} playhead={projection?.coordinate ?? rawPosition} followPlayhead={active} />

        <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-black/30 p-5">
          <div className="flex items-center justify-between gap-3">
            <span className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${status === "ready" ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100" : status === "reverse" || status === "off_route" ? "border-red-400/25 bg-red-400/10 text-red-100" : "border-amber-400/25 bg-amber-400/10 text-amber-100"}`}>{statusLabel(status)}</span>
            <span className="font-mono text-xs text-zinc-500">{(progress / 1000).toFixed(3)} km</span>
          </div>

          <div className="min-h-40">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[9px] uppercase tracking-[0.22em] text-zinc-600">Próxima llamada</p>
              <span className="font-mono text-sm font-bold text-orange-300">{upcoming ? `${Math.round(distanceToCall)} m` : "META"}</span>
            </div>
            <p className="mt-4 text-balance text-3xl font-semibold uppercase leading-tight text-white">{upcoming?.note.text ?? "META"}</p>
            {upcoming?.link ? <p className="mt-2 text-4xl font-black text-orange-300">{upcoming.link}</p> : null}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Metric label="Velocidad" value={speedMps !== null ? `${Math.round(speedMps * 3.6)} km/h` : "—"} />
            <Metric label="GPS ±" value={accuracy !== null ? `${Math.round(accuracy)} m` : "—"} />
            <Metric label="Eje" value={projection ? `${Math.round(projection.offRouteMeters)} m` : "—"} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={!lastSpokenPhrase} onClick={repeatLast} className="rounded-xl border border-zinc-700 px-3 py-2.5 text-[9px] font-semibold uppercase tracking-[0.13em] text-zinc-300 disabled:opacity-25">Repetir última</button>
            <button type="button" disabled={!upcoming} onClick={skipUpcoming} className="rounded-xl border border-zinc-700 px-3 py-2.5 text-[9px] font-semibold uppercase tracking-[0.13em] text-zinc-300 disabled:opacity-25">Saltar siguiente</button>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[8px] uppercase tracking-[0.18em] text-zinc-600">Anticipación</p>
                <p className="mt-1 text-xs text-zinc-400">{leadSeconds.toFixed(1)} s · ahora ≈ {callAhead} m</p>
              </div>
              <select value={leadSeconds} onChange={(event) => changeLeadSeconds(Number(event.target.value))} className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white">
                <option value={3.5}>3.5 s</option>
                <option value={4.5}>4.5 s</option>
                <option value={5.5}>5.5 s</option>
                <option value={6.5}>6.5 s</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
            <p className="text-[8px] uppercase tracking-[0.18em] text-zinc-600">Después</p>
            <p className="mt-1 text-sm font-medium text-zinc-300">{after?.note.text ?? "Meta"}</p>
          </div>

          <button type="button" disabled={!active || !projection} onClick={rearmFromHere} className="w-full rounded-xl border border-zinc-700 px-3 py-2.5 text-[9px] uppercase tracking-[0.15em] text-zinc-400 disabled:opacity-30">Rearmar llamadas desde aquí</button>
        </div>
      </div>

      {error ? <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs text-red-100">{error}</p> : null}
      <p className="text-[10px] leading-4 text-zinc-700">Beta de apoyo al reconocimiento. La posición GPS y las notas pueden contener errores; no sustituye las notas verificadas del equipo ni las indicaciones oficiales del tramo.</p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-2.5 text-center"><p className="text-sm font-semibold text-zinc-100">{value}</p><p className="mt-1 text-[8px] uppercase tracking-[0.14em] text-zinc-600">{label}</p></div>;
}
