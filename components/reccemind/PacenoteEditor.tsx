"use client";

import type { ReactNode } from "react";
import {
  renderRecceMindPacenote,
  type RecceMindContext,
  type RecceMindModifier,
  type RecceMindPacenote,
  type RecceMindRoadModifier,
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

  const updateDistance = (index: number, value: string) => {
    if (value.trim() === "") return;
    const meters = Number(value);
    if (!Number.isFinite(meters) || meters < 0) return;
    replaceStructured(index, { kind: "distance", meters: Math.round(meters) });
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
      updateCurve(index, structured, { severity, modifiers: [], target_severity: undefined });
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

  const toggleContext = (index: number, structured: StructuredCurve, context: RecceMindContext) => {
    const current = structured.contexts ?? [];
    const contexts = current.includes(context)
      ? current.filter((item) => item !== context)
      : [...current, context];
    updateCurve(index, structured, { contexts });
  };

  const toggleRoadModifier = (index: number, structured: StructuredCurve, modifier: RecceMindRoadModifier) => {
    const current = structured.road_modifiers ?? [];
    const road_modifiers = current.includes(modifier)
      ? current.filter((item) => item !== modifier)
      : [...current, modifier];
    updateCurve(index, structured, { road_modifiers });
  };

  const setModifier = (index: number, structured: StructuredCurve, modifier: RecceMindModifier | null) => {
    if (!modifier) {
      updateCurve(index, structured, { modifiers: [], target_severity: undefined });
      return;
    }
    const canUseModifier = modifier === "tightens" ? structured.severity > 1 : structured.severity < 6;
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
          const structuredMeters = note.structured?.kind === "distance" ? note.structured.meters : Number(note.text);
          return (
            <div key={`${note.distance}-${index}`} className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-black/20 px-3 py-2.5">
              <span className="w-16 shrink-0 text-right font-mono text-xs text-zinc-600">{Math.round(note.distance)} m</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Enlace</span>
              <div className="ml-auto flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={Number.isFinite(structuredMeters) ? Math.round(structuredMeters) : ""}
                  onChange={(event) => updateDistance(index, event.target.value)}
                  className="w-24 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-right font-mono text-sm font-semibold text-white outline-none transition focus:border-zinc-500"
                  aria-label="Distancia de enlace en metros"
                />
                <span className="text-xs text-zinc-500">m</span>
              </div>
            </div>
          );
        }

        const structured = note.structured;
        if (!structured || structured.kind !== "curve") {
          return (
            <div key={`${note.distance}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-zinc-600">{Math.round(note.distance)} m</span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-zinc-600">Nota libre</span>
              </div>
              <input value={note.text} onChange={(event) => replaceText(index, event.target.value)} className="w-full rounded-xl border border-zinc-800 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500" />
            </div>
          );
        }

        const modifier = structured.modifiers[0] ?? null;
        const contexts = structured.contexts ?? [];
        const roadModifiers = structured.road_modifiers ?? [];

        return (
          <article key={`${note.distance}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-white/20">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">{Math.round(note.distance)} m · curva {note.curve_index !== null ? note.curve_index + 1 : "—"}</p>
                <p className="mt-1 text-base font-semibold text-white">{note.text}</p>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-emerald-200">Estructurada</span>
            </div>

            <div className="mt-4 grid gap-4 border-t border-zinc-800/80 pt-4 lg:grid-cols-2">
              <Control label="Dirección">
                <div className="grid grid-cols-2 gap-1.5">
                  {(["left", "right"] as const).map((direction) => (
                    <Choice key={direction} active={structured.direction === direction} label={direction === "left" ? "Izquierda" : "Derecha"} onClick={() => updateCurve(index, structured, { direction })} />
                  ))}
                </div>
              </Control>

              <Control label="Grado de entrada">
                <div className="grid grid-cols-6 gap-1">
                  {SEVERITIES.map((severity) => (
                    <button key={severity} type="button" onClick={() => setSeverity(index, structured, severity)} className={`rounded-lg py-2 text-xs font-semibold transition ${structured.severity === severity ? "bg-rose-500 text-white" : "border border-zinc-800 bg-black/20 text-zinc-500 hover:text-white"}`}>{severity}</button>
                  ))}
                </div>
              </Control>

              <Control label="Evolución">
                <div className="grid grid-cols-3 gap-1.5">
                  {([[null, "Constante"], ["tightens", "Cierra"], ["opens", "Abre"]] as const).map(([value, label]) => {
                    const impossible = value === "tightens" ? structured.severity === 1 : value === "opens" ? structured.severity === 6 : false;
                    return <Choice key={label} active={modifier === value} label={label} disabled={impossible} onClick={() => setModifier(index, structured, value)} />;
                  })}
                </div>
              </Control>

              <Control label="Grado final">
                <div className={`grid grid-cols-6 gap-1 transition ${modifier ? "opacity-100" : "pointer-events-none opacity-25"}`}>
                  {SEVERITIES.map((severity) => {
                    const invalid = !modifier || (modifier === "tightens" ? severity >= structured.severity : severity <= structured.severity);
                    return <button key={severity} type="button" disabled={invalid} onClick={() => updateCurve(index, structured, { target_severity: severity })} className={`rounded-lg py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-20 ${structured.target_severity === severity ? "bg-amber-400 text-black" : "border border-zinc-800 bg-black/20 text-zinc-500 hover:text-white"}`}>{severity}</button>;
                  })}
                </div>
              </Control>

              <Control label="Longitud">
                <div className="grid grid-cols-3 gap-1.5">
                  <Choice active={structured.length === "standard"} label="Normal" onClick={() => updateCurve(index, structured, { length: "standard" })} />
                  <Choice active={structured.length === "long"} label="Larga" onClick={() => updateCurve(index, structured, { length: "long" })} />
                  <Choice active={structured.length === "very_long"} label="Muy larga" onClick={() => updateCurve(index, structured, { length: "very_long" })} />
                </div>
              </Control>

              <Control label="Trazada">
                <div className="grid grid-cols-3 gap-1.5">
                  <Choice active={!structured.line} label="—" onClick={() => updateCurve(index, structured, { line: undefined })} />
                  <Choice active={structured.line === "cut"} label="Cortar" onClick={() => updateCurve(index, structured, { line: "cut" })} />
                  <Choice active={structured.line === "dont_cut"} label="No cortar" onClick={() => updateCurve(index, structured, { line: "dont_cut" })} />
                </div>
              </Control>
            </div>

            <div className="mt-4 border-t border-zinc-800/80 pt-4">
              <p className="mb-2 text-[9px] uppercase tracking-[0.22em] text-zinc-600">Entorno y carretera</p>
              <div className="flex flex-wrap gap-2">
                <Toggle active={contexts.includes("crest")} label="En rasante" onClick={() => toggleContext(index, structured, "crest")} />
                <Toggle active={contexts.includes("junction")} label="En cruce" onClick={() => toggleContext(index, structured, "junction")} />
                <Toggle active={contexts.includes("barrier")} label="En valla" onClick={() => toggleContext(index, structured, "barrier")} />
                <Toggle active={roadModifiers.includes("narrows")} label="Se estrecha" onClick={() => toggleRoadModifier(index, structured, "narrows")} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Toggle active={structured.warnings.includes("caution")} label="Ojo" onClick={() => toggleWarning(index, structured, "caution")} />
              <Toggle active={structured.warnings.includes("brake")} label="Frena" onClick={() => toggleWarning(index, structured, "brake")} />
              <label className="flex items-center gap-2 rounded-full border border-zinc-800 bg-black/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                Marcha
                <select value={structured.gear ?? ""} onChange={(event) => updateCurve(index, structured, { gear: event.target.value ? Number(event.target.value) : undefined })} className="bg-transparent text-zinc-200 outline-none">
                  <option value="">—</option>
                  {[1, 2, 3, 4, 5, 6].map((gear) => <option key={gear} value={gear} className="bg-zinc-950">{gear}</option>)}
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
  return <div><p className="mb-2 text-[9px] uppercase tracking-[0.22em] text-zinc-600">{label}</p>{children}</div>;
}

function Choice({ active, label, onClick, disabled = false }: { active: boolean; label: string; onClick: () => void; disabled?: boolean }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={`rounded-xl px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-25 ${active ? "bg-white text-black" : "border border-zinc-800 bg-black/20 text-zinc-500 hover:text-white"}`}>{label}</button>;
}

function Toggle({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] transition ${active ? "border-rose-400/40 bg-rose-400/15 text-rose-100" : "border-zinc-800 bg-black/20 text-zinc-500 hover:text-white"}`}>{label}</button>;
}