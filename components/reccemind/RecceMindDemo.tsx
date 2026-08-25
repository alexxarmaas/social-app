"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import RecceMindMap from "@/components/reccemind/RecceMindMap";
import { rallyDistance } from "@/app/lib/reccemind-print";
import type { RecceMindAnalysis, RecceMindCoordinate } from "@/app/lib/reccemind";

const EARTH_RADIUS_M = 6_371_000;
const BASE_DEMO_SPEED_MPS = 25;

function segmentDistance(a: RecceMindCoordinate, b: RecceMindCoordinate) {
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const deltaLat = (b.lat - a.lat) * Math.PI / 180;
  const deltaLon = (b.lng - a.lng) * Math.PI / 180;
  const sinLat = Math.sin(deltaLat / 2);
  const sinLon = Math.sin(deltaLon / 2);
  const value = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(Math.max(0, 1 - value)));
}

function routeDistances(coordinates: RecceMindCoordinate[]) {
  const cumulative = [0];
  for (let index = 1; index < coordinates.length; index += 1) {
    cumulative.push(cumulative[index - 1] + segmentDistance(coordinates[index - 1], coordinates[index]));
  }
  return cumulative;
}

function coordinateAtDistance(coordinates: RecceMindCoordinate[], cumulative: number[], distance: number) {
  if (!coordinates.length) return null;
  if (distance <= 0) return coordinates[0];
  const total = cumulative.at(-1) ?? 0;
  if (distance >= total) return coordinates.at(-1) ?? null;

  let low = 1;
  let high = cumulative.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (cumulative[mid] < distance) low = mid + 1;
    else high = mid;
  }

  const endIndex = low;
  const startIndex = Math.max(0, endIndex - 1);
  const startDistance = cumulative[startIndex];
  const endDistance = cumulative[endIndex];
  const span = Math.max(0.001, endDistance - startDistance);
  const ratio = Math.max(0, Math.min(1, (distance - startDistance) / span));
  const start = coordinates[startIndex];
  const end = coordinates[endIndex];
  return {
    lat: start.lat + (end.lat - start.lat) * ratio,
    lng: start.lng + (end.lng - start.lng) * ratio,
  };
}

function buildCalls(result: RecceMindAnalysis) {
  return result.pacenotes.flatMap((note, index) => {
    if (note.type === "distance") return [];
    const following = result.pacenotes[index + 1];
    const link = following?.type === "distance" ? rallyDistance(following.text) : null;
    return [{
      id: `${index}-${note.distance}-${note.text}`,
      note,
      phrase: link ? `${note.text}, ${link}` : note.text,
      link,
    }];
  });
}

export default function RecceMindDemo({ result, coordinates }: { result: RecceMindAnalysis; coordinates: RecceMindCoordinate[] }) {
  const cumulative = useMemo(() => routeDistances(coordinates), [coordinates]);
  const totalDistance = cumulative.at(-1) ?? 0;
  const calls = useMemo(() => buildCalls(result), [result]);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const lastSpokenRef = useRef<string | null>(null);

  const upcomingIndex = calls.findIndex((call) => call.note.distance >= progress);
  const normalizedUpcomingIndex = upcomingIndex === -1 ? Math.max(0, calls.length - 1) : upcomingIndex;
  const upcoming = calls[normalizedUpcomingIndex] ?? null;
  const after = calls[normalizedUpcomingIndex + 1] ?? null;
  const distanceToCall = upcoming ? Math.max(0, upcoming.note.distance - progress) : 0;
  const playhead = useMemo(() => coordinateAtDistance(coordinates, cumulative, progress), [coordinates, cumulative, progress]);
  const selectedCurveIndex = upcoming?.note.curve_index ?? null;

  useEffect(() => {
    if (!playing || totalDistance <= 0) return;
    let frame = 0;
    let previous = performance.now();

    const tick = (now: number) => {
      const elapsed = Math.min(0.1, Math.max(0, (now - previous) / 1000));
      previous = now;
      const next = Math.min(totalDistance, progressRef.current + elapsed * BASE_DEMO_SPEED_MPS * multiplier);
      progressRef.current = next;
      setProgress(next);
      if (next >= totalDistance) {
        setPlaying(false);
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [multiplier, playing, totalDistance]);

  useEffect(() => {
    if (!playing || !voiceEnabled || !upcoming || !("speechSynthesis" in window)) return;
    if (lastSpokenRef.current === upcoming.id) return;
    lastSpokenRef.current = upcoming.id;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(upcoming.phrase);
    utterance.lang = "es-ES";
    utterance.rate = 1.35;
    window.speechSynthesis.speak(utterance);
  }, [playing, upcoming, voiceEnabled]);

  const setDemoProgress = (next: number) => {
    const clamped = Math.max(0, Math.min(totalDistance, next));
    progressRef.current = clamped;
    setProgress(clamped);
    lastSpokenRef.current = null;
  };

  const restart = () => {
    window.speechSynthesis?.cancel();
    setPlaying(false);
    setDemoProgress(0);
  };

  if (coordinates.length < 2 || totalDistance <= 0) {
    return <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 text-sm text-zinc-500">No hay geometría suficiente para simular este tramo.</div>;
  }

  return (
    <section className="space-y-4 rounded-[2rem] border border-emerald-400/15 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_32%),rgba(9,9,11,0.95)] p-4 sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-300/60">Modo demo</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Simulación visual de copiloto</h2>
          <p className="mt-2 text-xs leading-5 text-zinc-500">Recorre el trazado con un ritmo virtual, muestra la siguiente llamada y reproduce la nota como la oiría el equipo.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setPlaying((current) => !current)} className="rounded-xl bg-emerald-300 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-black">{playing ? "Pausar" : "Reproducir"}</button>
          <button type="button" onClick={restart} className="rounded-xl border border-zinc-700 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-zinc-300">Reiniciar</button>
          <button type="button" onClick={() => setVoiceEnabled((current) => !current)} className={`rounded-xl border px-4 py-2 text-[10px] uppercase tracking-[0.18em] ${voiceEnabled ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100" : "border-zinc-700 text-zinc-500"}`}>Voz {voiceEnabled ? "ON" : "OFF"}</button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.55fr)]">
        <RecceMindMap
          coordinates={coordinates}
          curves={result.curves}
          selectedCurveIndex={selectedCurveIndex}
          onSelectCurve={() => undefined}
          playhead={playhead}
          followPlayhead
        />

        <div className="flex flex-col justify-between rounded-[1.5rem] border border-white/10 bg-black/30 p-5">
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[9px] uppercase tracking-[0.24em] text-zinc-600">Próxima nota</p>
              <span className="font-mono text-xs text-emerald-300">{Math.round(distanceToCall)} m</span>
            </div>
            <p className="mt-4 text-balance text-3xl font-semibold uppercase leading-tight text-white">{upcoming?.note.text ?? "META"}</p>
            {upcoming?.link ? <p className="mt-3 text-4xl font-black text-emerald-300">{upcoming.link}</p> : null}
          </div>

          <div className="mt-8 space-y-5">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[8px] uppercase tracking-[0.2em] text-zinc-600">Después</p>
              <p className="mt-1 text-sm font-medium text-zinc-300">{after?.note.text ?? "Meta"}</p>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-[9px] uppercase tracking-[0.18em] text-zinc-600">
                <span>{(progress / 1000).toFixed(2)} km</span>
                <span>{Math.round(BASE_DEMO_SPEED_MPS * 3.6 * multiplier)} km/h virtual</span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(1, totalDistance)}
                step={1}
                value={progress}
                onChange={(event) => setDemoProgress(Number(event.target.value))}
                className="w-full accent-emerald-300"
              />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[0.5, 1, 2, 4].map((value) => (
                <button key={value} type="button" onClick={() => setMultiplier(value)} className={`rounded-lg border px-2 py-2 text-[10px] font-semibold ${multiplier === value ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-100" : "border-zinc-800 text-zinc-500"}`}>×{value}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
