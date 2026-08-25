"use client";

import { reviewAnalysis } from "@/app/lib/reccemind-confidence";
import type { RecceMindAnalysis, RecceMindThresholds } from "@/app/lib/reccemind";

interface Props {
  result: RecceMindAnalysis;
  thresholds: RecceMindThresholds;
  onSelectCurve: (index: number) => void;
}

function confidenceLabel(score: number) {
  return `${Math.round(score * 100)} %`;
}

export default function RecceMindReviewPanel({ result, thresholds, onSelectCurve }: Props) {
  const summary = reviewAnalysis(result.curves, thresholds);
  const reviewItems = summary.items
    .filter((item) => item.needsReview || item.level === "medium")
    .sort((a, b) => Number(b.needsReview) - Number(a.needsReview) || a.score - b.score)
    .slice(0, 12);

  return (
    <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Revisión inteligente</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Dónde merece la pena mirar dos veces</h2>
          <p className="mt-2 max-w-3xl text-xs leading-6 text-zinc-500">
            RecceMind prioriza curvas cerca de un umbral, transiciones fuertes y detecciones geométricamente débiles. La confianza es una ayuda de revisión, no una validación automática de la nota.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <SummaryPill label="Alta" value={summary.high} tone="high" />
          <SummaryPill label="Media" value={summary.medium} tone="medium" />
          <SummaryPill label="Revisar" value={summary.review} tone="review" />
        </div>
      </div>

      {reviewItems.length ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {reviewItems.map((item) => {
            const curve = result.curves[item.index];
            const entry = curve.entry_classification ?? curve.classification;
            const exit = curve.exit_classification ?? curve.classification;
            return (
              <button
                key={`${curve.start_idx}-${curve.end_idx}-${item.index}`}
                type="button"
                onClick={() => onSelectCurve(item.index)}
                className={`rounded-2xl border p-4 text-left transition hover:border-white/30 ${item.needsReview ? "border-amber-400/25 bg-amber-400/[0.06]" : "border-zinc-800 bg-black/20"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.22em] text-zinc-600">Curva {item.index + 1} · {Math.round(curve.start_distance)} m</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {curve.direction} {entry}{exit !== entry ? ` → ${exit}` : ""}
                    </p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] ${item.needsReview ? "border-amber-300/30 bg-amber-300/10 text-amber-100" : "border-sky-300/20 bg-sky-300/[0.06] text-sky-100"}`}>
                    {confidenceLabel(item.score)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(item.reasons.length ? item.reasons : ["Margen de clasificación reducido"]).map((reason) => (
                    <span key={reason} className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[9px] text-zinc-400">{reason}</span>
                  ))}
                </div>
                <p className="mt-3 text-[9px] uppercase tracking-[0.18em] text-zinc-600">Fuente: {item.source === "ml" ? "modelo del piloto" : "geometría / umbrales"}</p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-4 text-sm text-emerald-100">
          No hay curvas destacadas para revisión prioritaria en este análisis.
        </div>
      )}
    </section>
  );
}

function SummaryPill({ label, value, tone }: { label: string; value: number; tone: "high" | "medium" | "review" }) {
  const classes = tone === "high"
    ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-100"
    : tone === "medium"
      ? "border-sky-400/20 bg-sky-400/[0.06] text-sky-100"
      : "border-amber-400/25 bg-amber-400/[0.07] text-amber-100";

  return (
    <div className={`min-w-20 rounded-2xl border px-3 py-2 ${classes}`}>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-[8px] uppercase tracking-[0.18em] opacity-60">{label}</p>
    </div>
  );
}
