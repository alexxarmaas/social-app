"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { RecceMindSavedStageSummary } from "@/app/lib/reccemind-stage";

function dateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function RecceMindStageLibrary() {
  const [stages, setStages] = useState<RecceMindSavedStageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState(true);

  const loadStages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/reccemind/stages", { cache: "no-store" });
      const payload = await response.json() as { stages?: RecceMindSavedStageSummary[]; storageReady?: boolean; error?: string };
      if (!response.ok) throw new Error(payload.error || "No se pudieron cargar los tramos.");
      setStages(payload.stages ?? []);
      setStorageReady(payload.storageReady !== false);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los tramos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStages();
  }, []);

  const removeStage = async (stage: RecceMindSavedStageSummary) => {
    if (!window.confirm(`¿Eliminar "${stage.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      const response = await fetch(`/api/reccemind/stages/${stage.id}`, { method: "DELETE" });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "No se pudo eliminar el tramo.");
      setStages((current) => current.filter((item) => item.id !== stage.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar el tramo.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.12),transparent_32%),rgba(9,9,11,0.94)] p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
        <div>
          <p className="text-[10px] uppercase tracking-[0.42em] text-rose-300/60">RecceMind</p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Mis tramos</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500">Biblioteca persistente de reconocimientos, notas editadas y análisis preparados por tu cuenta.</p>
        </div>
        <Link href="/reccemind" className="rounded-xl bg-white px-5 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-black">Preparar nuevo tramo</Link>
      </section>

      {!storageReady ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] p-4 text-sm text-amber-100">
          La biblioteca está preparada en código pero falta aplicar la migración de base de datos de RecceMind.
        </div>
      ) : null}

      {error ? <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-100">{error}</div> : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-52 animate-pulse rounded-[1.5rem] border border-zinc-800 bg-zinc-900/50" />)}
        </div>
      ) : stages.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stages.map((stage) => (
            <article key={stage.id} className="group flex min-h-56 flex-col justify-between rounded-[1.5rem] border border-zinc-800 bg-zinc-950/80 p-5 transition hover:border-white/20">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Actualizado {dateLabel(stage.updatedAt)}</p>
                    <h2 className="mt-2 truncate text-xl font-semibold text-white">{stage.name}</h2>
                    <p className="mt-1 truncate text-xs text-zinc-600">{stage.driverId}</p>
                  </div>
                  {stage.reviewCount > 0 ? <span className="shrink-0 rounded-full border border-amber-400/25 bg-amber-400/[0.08] px-2.5 py-1 text-[9px] font-semibold text-amber-100">{stage.reviewCount} revisar</span> : <span className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-2.5 py-1 text-[9px] text-emerald-100">Revisado</span>}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <Metric label="Km" value={stage.distanceMeters ? (stage.distanceMeters / 1000).toFixed(2) : "—"} />
                  <Metric label="Curvas" value={String(stage.curveCount)} />
                  <Metric label="Notas" value={String(stage.noteCount)} />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <Link href={`/reccemind?stage=${encodeURIComponent(stage.id)}`} className="flex-1 rounded-xl bg-white px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-black">Abrir</Link>
                <button type="button" onClick={() => void removeStage(stage)} className="rounded-xl border border-zinc-800 px-3 py-2.5 text-[10px] uppercase tracking-[0.16em] text-zinc-600 transition hover:border-red-400/30 hover:text-red-300">Eliminar</button>
              </div>
            </article>
          ))}
        </div>
      ) : storageReady ? (
        <div className="flex min-h-80 items-center justify-center rounded-[2rem] border border-dashed border-zinc-800 bg-white/[0.02] p-8 text-center">
          <div className="max-w-md">
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600">Biblioteca vacía</p>
            <h2 className="mt-3 text-2xl font-semibold text-zinc-300">Guarda tu primer tramo</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600">Analiza un KMZ, GPX, ruta o telemetría y usa “Guardar tramo” para conservar el trabajo en tu cuenta.</p>
            <Link href="/reccemind" className="mt-5 inline-block rounded-xl border border-zinc-700 px-4 py-2.5 text-[10px] uppercase tracking-[0.18em] text-zinc-300">Ir a preparar</Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-zinc-800 bg-black/20 p-2.5 text-center"><p className="text-sm font-semibold text-zinc-200">{value}</p><p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-zinc-600">{label}</p></div>;
}
