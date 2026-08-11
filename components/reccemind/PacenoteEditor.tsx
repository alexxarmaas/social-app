"use client";

import type { ReactNode } from "react";
import {
  renderRecceMindPacenote,
  type RecceMindModifier,
  type RecceMindPacenote,
  type RecceMindSeverity,
  type RecceMindStructuredPacenote,
  type RecceMindWarning,
} from "@/app/lib/reccemind";

const SEVERITIES = [1, 2, 3, 4, 5, 6] as const;

type StructuredCurve = Extract<RecceMindStructuredPacenote, { kind: "curve" }>;

interface PacenoteEditorProps {
  pacenotes: RecceMindPacenote[];
  onChange: (pacenotes: RecceMindPacenote[]) => void;
}

function nextTarget(severity: RecceMindSeverity, modifier: RecceMindModifier) {
  if (modifier === "tightens") return Math.max(1, severity - 1) as RecceMindSeverity;
  return Math.min(6, severity + 1) as RecceMindSeverity;
}

function isValidTarget(
  severity: RecceMindSeverity,
  target: RecceMindSeverity | undefined,
  modifier: RecceMindModifier,
) {
  if (!target) return false;
  return modifier === "tightens" ? target < severity : target > severity;
}

export default function PacenoteEditor({ pacenotes, onChange }: PacenoteEditorProps) {
  const replaceStructured = (index: number, structured: RecceMindStructuredPacenote) => {
    onChange(
      pacenotes.map((note, noteIndex) =>
        noteIndex === index
          ? { ...note, structured, text: renderRecceMindPacenote(structured) }
          : note,
      ),
    );
  };

  const replaceText = (index: number, text: string) => {
    onChange(
      pacenotes.map((note, noteIndex) =>
        noteIndex === index ? { ...note, text, structured: undefined } : note,
      ),
    );
  };

  const updateCurve = (index: number, structured: StructuredCurve, patch: Partial<StructuredCurve>) => {
    replaceStructured(index, { ...structured, ...patch });
  };

  const setSeverity = (index: number, structured: StructuredCurve, severity: RecceMindSeverity) => {
    const modifier = structured.modifiers[0];
    if (!modifier) {
      updateCurve(index, structured, { severity });
      return;
    }

    const modifierStillPossible = modifier === "tightens" ? severity > 1 : severity < 6;
    if (!modifierStillPossible) {
      updateCurve(index, structured, {
        severity,
        modifiers: [],
        target_severity: undefined,
      });
      return;
    }

    updateCurve(index, structured, {
      severity,
      target_severity: isValidTarget(severity, structured.target_severity, modifier)
        ? structured.target_severity
        : nextTarget(severity, modifier),
    });
  };

  const toggleWarning = (index: number, structured: StructuredCurve, warning: RecceMindWarning) => {
    const warnings = structured.warnings.includes(warning)
      ? structured.warnings.filter((item) => item !== warning)
      : [...structured.warnings, warning];
    updateCurve(index, structured, { warnings });
  };

  const setModifier = (
    index: number,
    structured: StructuredCurve,
    modifier: RecceMindModifier | null,
  ) => {
    if (!modifier) {
      updateCurve(index, structured, { modifiers: [], target_severity: undefined });
      return;
    }

    const canUseModifier = modifier === "tightens"
      ? structured.severity > 1
      : structured.severity < 6;
    if (!canUseModifier) return;

    updateCurve(index, structured, {
      modifiers: [modifier],
      target_severity: isValidTarget(structured.severity, structured.target_severity, modifier)
        ? structured.target_severity
        : nextTarget(structured.severity, modifier),
    });
  };

  return (
    <div className="space-y-3">
      {pacenotes.map((note, index) => {
        if (note.type === "distance") {
          return (
            <div
              key={`${note.distance}-${index}`}
              className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-black/20 px-3 py-2.5"
            >
              <span className="w-16 shrink-0 text-right font-mono text-xs text-zinc-600">
                {Math.round(note.distance)} m
              </span>
              <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                {note.text} m
              </span>
            </div>
          );
        }

        const structured = note.structured;
        if (!structured || structured.kind !== "curve") {
          return (
            <div
              key={`${note.distance}-${index}`}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-zinc-600">{Math.round(note.distance)} m</span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-zinc-600">Nota libre</span>
              </div>
              <input
                value={note.text}
                onChange={(event) => replaceText(index, event.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
              />
            </div>
          );
        }

        const modifier = structured.modifiers[0] ?? null;
        return (
          <article
            key={`${note.distance}-${index}`}
            className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-white/20"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                  {Math.round(note.distance)} m · curva {note.curve_index !== null ? note.curve_index + 1 : "—"}
                </p>
                <p className="mt-1 text-base font-semibold text-white">{note.text}</p>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-emerald-200">
                Estructurada
              </span>
            </div>

            <div className="mt-4 grid gap-4 border-t border-zinc-800/80 pt-4 lg:grid-cols-2">
              <Control label="Dirección">
                <div className="grid grid-cols-2 gap-1.5">
                  {(["left", "right"] as const).map((direction) => (
                    <button
                      key={direction}
                      type="button"
                      onClick={() => updateCurve(index, structured, { direction })}
                      className={`rounded-xl px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] transition ${structured.direction === direction ? "bg-white text-black" : "border border-zinc-800 bg-black/20 text-zinc-500 hover:text-white"}`}
                    >
                      {direction === "left" ? "Izquierda" : "Derecha"}
                    </button>
                  ))}
                </div>
              </Control>

              <Control label="Grado de entrada">
                <div className="grid grid-cols-6 gap-1">
                  {SEVERITIES.map((severity) => (
                    <button
                      key={severity}
                      type="button"
                      onClick={() => setSeverity(index, structured, severity)}
                      className={`rounded-lg py-2 text-xs font-semibold transition ${structured.severity === severity ? "bg-rose-500 text-white" : "border border-zinc-800 bg-black/20 text-zinc-500 hover:text-white"}`}
                    >
                      {severity}
                    </button>
                  ))}
                </div>
              </Control>

              <Control label="Evolución">
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    [null, "Constante"],
                    ["tightens", "Cierra"],
                    ["opens", "Abre"],
                  ] as const).map(([value, label]) => {
                    const impossible = value === "tightens"
                      ? structured.severity === 1
                      : value === "opens"
                        ? structured.severity === 6
                        : false;
                    return (
                      <button
                        key={label}
                        type="button"
                        disabled={impossible}
                        onClick={() => setModifier(index, structured, value)}
                        className={`rounded-xl px-2 py-2 text-[10px] uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-25 ${modifier === value ? "bg-white text-black" : "border border-zinc-800 bg-black/20 text-zinc-500 hover:text-white"}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </Control>

              <Control label="Grado final">
                <div className={`grid grid-cols-6 gap-1 transition ${modifier ? "opacity-100" : "pointer-events-none opacity-25"}`}>
                  {SEVERITIES.map((severity) => {
                    const invalid = !modifier || (modifier === "tightens"
                      ? severity >= structured.severity
                      : severity <= structured.severity);
                    return (
                      <button
                        key={severity}
                        type="button"
                        disabled={invalid}
                        onClick={() => updateCurve(index, structured, { target_severity: severity })}
                        className={`rounded-lg py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-20 ${structured.target_severity === severity ? "bg-amber-400 text-black" : "border border-zinc-800 bg-black/20 text-zinc-500 hover:text-white"}`}
                      >
                        {severity}
                      </button>
                    );
                  })}
                </div>
              </Control>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Toggle
                active={structured.length === "long"}
                label="Larga"
                onClick={() => updateCurve(index, structured, { length: structured.length === "long" ? "standard" : "long" })}
              />
              <Toggle
                active={structured.warnings.includes("caution")}
                label="Ojo"
                onClick={() => toggleWarning(index, structured, "caution")}
              />
              <Toggle
                active={structured.warnings.includes("brake")}
                label="Frena"
                onClick={() => toggleWarning(index, structured, "brake")}
              />
              <label className="flex items-center gap-2 rounded-full border border-zinc-800 bg-black/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                Marcha
                <select
                  value={structured.gear ?? ""}
                  onChange={(event) => {
                    const gear = event.target.value ? Number(event.target.value) : undefined;
                    updateCurve(index, structured, { gear });
                  }}
                  className="bg-transparent text-zinc-200 outline-none"
                >
                  <option value="">—</option>
                  {[1, 2, 3, 4, 5, 6].map((gear) => (
                    <option key={gear} value={gear} className="bg-zinc-950">{gear}</option>
                  ))}
                </select>
              </label>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Control({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[9px] uppercase tracking-[0.22em] text-zinc-600">{label}</p>
      {children}
    </div>
  );
}

function Toggle({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] transition ${active ? "border-rose-400/40 bg-rose-400/15 text-rose-100" : "border-zinc-800 bg-black/20 text-zinc-500 hover:text-white"}`}
    >
      {label}
    </button>
  );
}
