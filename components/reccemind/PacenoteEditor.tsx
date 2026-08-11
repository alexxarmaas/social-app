"use client";

import {
  renderRecceMindPacenote,
  type RecceMindModifier,
  type RecceMindPacenote,
  type RecceMindSeverity,
  type RecceMindStructuredPacenote,
  type RecceMindWarning,
} from "@/app/lib/reccemind";

const SEVERITIES = [1, 2, 3, 4, 5, 6] as const;

interface PacenoteEditorProps {
  pacenotes: RecceMindPacenote[];
  onChange: (pacenotes: RecceMindPacenote[]) => void;
}

function nextTarget(severity: RecceMindSeverity, modifier: RecceMindModifier) {
  if (modifier === "tightens") return Math.max(1, severity - 1) as RecceMindSeverity;
  return Math.min(6, severity + 1) as RecceMindSeverity;
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

  const updateCurve = (
    index: number,
    structured: Extract<RecceMindStructuredPacenote, { kind: "curve" }>,
    patch: Partial<Extract<RecceMindStructuredPacenote, { kind: "curve" }>>,
  ) => {
    replaceStructured(index, { ...structured, ...patch });
  };

  const toggleWarning = (
    index: number,
    structured: Extract<RecceMindStructuredPacenote, { kind: "curve" }>,
    warning: RecceMindWarning,
  ) => {
    const warnings = structured.warnings.includes(warning)
      ? structured.warnings.filter((item) => item !== warning)
      : [...structured.warnings, warning];
    updateCurve(index, structured, { warnings });
  };

  const setModifier = (
    index: number,
    structured: Extract<RecceMindStructuredPacenote, { kind: "curve" }>,
    modifier: RecceMindModifier | null,
  ) => {
    if (!modifier) {
      const { target_severity: _targetSeverity, ...withoutTarget } = structured;
      replaceStructured(index, { ...withoutTarget, modifiers: [] });
      return;
    }

    updateCurve(index, structured, {
      modifiers: [modifier],
      target_severity: structured.target_severity ?? nextTarget(structured.severity, modifier),
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
                      onClick={() => updateCurve(index, structured, { severity })}
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
                  ] as const).map(([value, label]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setModifier(index, structured, value)}
                      className={`rounded-xl px-2 py-2 text-[10px] uppercase tracking-[0.14em] transition ${modifier === value ? "bg-white text-black" : "border border-zinc-800 bg-black/20 text-zinc-500 hover:text-white"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Control>

              <Control label="Grado final">
                <div className={`grid grid-cols-6 gap-1 transition ${modifier ? "opacity-100" : "pointer-events-none opacity-25"}`}>
                  {SEVERITIES.map((severity) => (
                    <button
                      key={severity}
                      type="button"
                      disabled={!modifier}
                      onClick={() => updateCurve(index, structured, { target_severity: severity })}
                      className={`rounded-lg py-2 text-xs font-semibold transition ${structured.target_severity === severity ? "bg-amber-400 text-black" : "border border-zinc-800 bg-black/20 text-zinc-500 hover:text-white"}`}
                    >
                      {severity}
                    </button>
                  ))}
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

function Control({ label, children }: { label: string; children: React.ReactNode }) {
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
