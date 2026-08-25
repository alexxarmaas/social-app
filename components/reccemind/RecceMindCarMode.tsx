"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import RecceMindLiveCopilot from "@/components/reccemind/RecceMindLiveCopilot";
import RecceMindVoiceCapture from "@/components/reccemind/RecceMindVoiceCapture";
import { decodeGooglePolyline, type RecceMindAnalysis, type RecceMindPacenote } from "@/app/lib/reccemind";
import type { RecceMindSavedStage } from "@/app/lib/reccemind-stage";

interface RecceMindCarModeProps {
  stageId: string;
}

function distanceNote(meters: number, atDistance: number): RecceMindPacenote {
  const rounded = Math.max(0, Math.round(meters));
  return {
    type: "distance",
    text: String(rounded),
    curve_index: null,
    distance: Math.round(atDistance),
    structured: { kind: "distance", meters: rounded },
  };
}

function insertManualCall(analysis: RecceMindAnalysis, text: string, distance: number): RecceMindAnalysis {
  const calls = analysis.pacenotes.filter((note) => note.type === "note");
  const insertionDistance = Math.max(0, Math.round(distance));
  const previousCall = [...calls].reverse().find((note) => note.distance <= insertionDistance) ?? null;
  const nextCall = calls.find((note) => note.distance > insertionDistance) ?? null;

  const manual: RecceMindPacenote = {
    type: "note",
    text,
    curve_index: null,
    distance: insertionDistance,
    structured: { kind: "custom", label: text },
  };

  if (!nextCall) {
    const nextPacenotes = [...analysis.pacenotes];
    const previousEnd = previousCall?.curve_index !== null && previousCall?.curve_index !== undefined
      ? analysis.curves[previousCall.curve_index]?.end_distance ?? previousCall.distance
      : previousCall?.distance ?? 0;
    const gap = Math.max(0, insertionDistance - previousEnd);
    if (gap > 10) nextPacenotes.push(distanceNote(gap, insertionDistance));
    nextPacenotes.push(manual);
    return { ...analysis, pacenotes: nextPacenotes };
  }

  const nextIndex = analysis.pacenotes.indexOf(nextCall);
  let replaceFrom = nextIndex;
  if (nextIndex > 0 && analysis.pacenotes[nextIndex - 1]?.type === "distance") replaceFrom = nextIndex - 1;

  const previousEnd = previousCall?.curve_index !== null && previousCall?.curve_index !== undefined
    ? analysis.curves[previousCall.curve_index]?.end_distance ?? previousCall.distance
    : previousCall?.distance ?? 0;
  const firstGap = Math.max(0, insertionDistance - previousEnd);
  const secondGap = Math.max(0, nextCall.distance - insertionDistance);
  const replacement: RecceMindPacenote[] = [];
  if (firstGap > 10) replacement.push(distanceNote(firstGap, insertionDistance));
  replacement.push(manual);
  if (secondGap > 10) replacement.push(distanceNote(secondGap, nextCall.distance));
  replacement.push(nextCall);

  const nextPacenotes = [
    ...analysis.pacenotes.slice(0, replaceFrom),
    ...replacement,
    ...analysis.pacenotes.slice(nextIndex + 1),
  ];
  return { ...analysis, pacenotes: nextPacenotes };
}

export default function RecceMindCarMode({ stageId }: RecceMindCarModeProps) {
  const [stage, setStage] = useState<RecceMindSavedStage | null>(null);
  const [analysis, setAnalysis] = useState<RecceMindAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/reccemind/stages/${encodeURIComponent(stageId)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { stage?: RecceMindSavedStage; error?: string };
        if (!response.ok || !payload.stage) throw new Error(payload.error || "No se pudo cargar el tramo.");
        if (cancelled) return;
        setStage(payload.stage);
        setAnalysis(payload.stage.analysis);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el tramo.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [stageId]);

  const coordinates = useMemo(() => analysis?.polyline ? decodeGooglePolyline(analysis.polyline) : [], [analysis]);

  const persistAnalysis = async (nextAnalysis: RecceMindAnalysis, successMessage: string) => {
    if (!stage || saving) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/reccemind/stages/${encodeURIComponent(stage.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: stage.name,
          driverId: stage.driverId,
          sourceType: stage.sourceType,
          sourceName: stage.sourceName,
          analysis: nextAnalysis,
          thresholds: stage.thresholds,
        }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "No se pudo guardar el tramo.");
      setAnalysis(nextAnalysis);
      setMessage(successMessage);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el tramo.");
    } finally {
      setSaving(false);
    }
  };

  const insertVoiceNote = (text: string, distance: number) => {
    if (!analysis) return;
    const nextAnalysis = insertManualCall(analysis, text, distance);
    void persistAnalysis(nextAnalysis, `Dictado guardado en ${(distance / 1000).toFixed(3)} km.`);
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center rounded-[2rem] border border-zinc-800 bg-zinc-950/70 text-xs uppercase tracking-[0.24em] text-zinc-600">Preparando modo coche</div>;
  if (error && !analysis) return <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-5 text-sm text-red-100">{error}</div>;
  if (!stage || !analysis) return null;

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.13),transparent_35%),rgba(9,9,11,0.94)] p-5 sm:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-orange-300/65">RecceMind · Modo coche</p>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{stage.name}</h1>
            <p className="mt-2 text-sm text-zinc-500">{stage.driverId} · {(stage.distanceMeters ? stage.distanceMeters / 1000 : 0).toFixed(2)} km · {analysis.pacenotes.filter((note) => note.type === "note").length} llamadas</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/reccemind?stage=${encodeURIComponent(stage.id)}`} className="rounded-xl border border-zinc-700 px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-zinc-300">Editar tramo</Link>
            <Link href="/reccemind/tramos" className="rounded-xl border border-zinc-800 px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-zinc-500">Mis tramos</Link>
          </div>
        </div>
      </section>

      <RecceMindVoiceCapture coordinates={coordinates} onInsert={insertVoiceNote} />
      {saving ? <div className="rounded-xl border border-sky-400/15 bg-sky-400/[0.05] px-4 py-3 text-xs text-sky-100">Guardando cambio en Mis tramos…</div> : null}
      {message ? <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-xs text-emerald-100">{message}</div> : null}
      {error ? <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs text-red-100">{error}</div> : null}

      <RecceMindLiveCopilot result={analysis} coordinates={coordinates} />
    </div>
  );
}
