"use client";

import { useMemo, useState, type ReactNode } from "react";
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
const QUICK_CUSTOM_NOTES = ["Bache", "Puente", "Agua", "Público", "Árbol", "Cambio de asfalto"] as const;

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

function noteKindLabel(note: RecceMindPacenote) {
  if (note.type === "distance") return "Enlace";
  if (note.structured?.kind === "curve") return note.structured.direction === "right" ? "Derecha" : "Izquierda";
  if (note.structured?.kind === "crest") return "Rasante";
  if (note.structured?.kind === "jump") return "Salto";
  return "Manual";
}

function noteAccent(note: RecceMindPacenote) {
  if (note.type === "distance") return "border-l-zinc-700";
  if (note.structured?.kind === "curve") {
    return note.structured.direction === "right" ? "border-l-red-500" : "border-l-blue-500";
  }
  return "border-l-amber-400";
}

export default function PacenoteEditor({ pacenotes, onChange }: PacenoteEditorProps) {
  const firstCallIndex = Math.max(0, pacenotes.findIndex((note) => note.type === "note"));
  const [selectedIndex, setSelectedIndex] = useState(firstCallIndex);
  const [query, setQuery] = useState("");
  const [showDistances, setShowDistances] = useState(true);

  const activeIndex = pacenotes.length ? Math.min(selectedIndex, pacenotes.length - 1) : -1;
  const activeNote = activeIndex >= 0 ? pacenotes[activeIndex] : null;

  const visibleIndices = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    return pacenotes.flatMap((note, index) => {
      if (!showDistances && note.type === "distance") return [];
      if (normalizedQuery && !`${note.text} ${Math.round(note.distance)} ${noteKindLabel(note)}`.toLocaleLowerCase("es").includes(normalizedQuery)) return [];
      return [index];
    });
  }, [pacenotes, query, showDistances]);

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
    const current = pacenotes[index];
    if (current?.structured?.kind === "custom") {
      replaceStructured(index, { kind: "custom", label: text });
      return;
    }
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

  const addCustomNote = (label = "Nueva nota") => {
    const baseDistance = activeNote?.distance ?? pacenotes.at(-1)?.distance ?? 0;
    const insertAt = activeIndex >= 0 ? activeIndex + 1 : pacenotes.length;
    const nextNote: RecceMindPacenote = {
      type: "note",
      text: label,
      curve_index: null,
      distance: baseDistance,
      structured: { kind: "custom", label },
    };
    const next = [...pacenotes];
    next.splice(insertAt, 0, nextNote);
    onChange(next);
    setSelectedIndex(insertAt);
  };

  const removeManualNote = (index: number) => {
    const note = pacenotes[index];
    if (!note || note.curve_index !== null || note.type !== "note") return;
    onChange(pacenotes.filter((_, noteIndex) => noteIndex !== index));
    setSelectedIndex(Math.max(0, index - 1));
  };

  const selectRelative = (offset: number) => {
    if (!pacenotes.length || activeIndex < 0) return;
    setSelectedIndex(Math.max(0, Math.min(pacenotes.length - 1, activeIndex + offset)));
  };

  const noteCount = pacenotes.filter((note) => note.type === "note").length;
  const distanceCount = pacenotes.length - noteCount;

  if (!pacenotes.length) {
    return <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-600">No hay notas que editar.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-800 bg-black/25 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.24em] text-zinc-600">Navegador de notas</p>
            <p className="mt-1 text-xs text-zinc-400">{noteCount} llamadas · {distanceCount} enlaces · edita una nota cada vez</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar nota o metro…"
              className="min-w-0 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white outline-none placeholder:text-zinc-700 focus:border-zinc-500 sm:w-52"
            />
            <button
              type="button"
              onClick={() => setShowDistances((current) => !current)}
              className={`rounded-xl border px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] ${showDistances ? "border-zinc-700 text-zinc-300" : "border-amber-400/30 bg-amber-400/10 text-amber-100"}`}
            >
              {showDistances ? "Ocultar enlaces" : "Mostrar enlaces"}
            </button>
            <button type="button" onClick={() => addCustomNote()} className="rounded-xl bg-white px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-black">
              + Nota manual
            </button>
          </div>
        </div>
      </div>

      <div className="grid min-h-[34rem] gap-4 xl:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)]">
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-black/20">
          <div className="max-h-[46rem] space-y-1 overflow-y-auto p-2">
            {visibleIndices.length ? visibleIndices.map((index) => {
              const note = pacenotes[index];
              const active = index === activeIndex;
              const curve = note.structured?.kind === "curve" ? note.structured : null;
              return (
                <button
                  key={`${note.distance}-${index}-${note.text}`}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`w-full border-l-4 ${noteAccent(note)} rounded-xl border-y border-r px-3 py-2.5 text-left transition ${active ? "border-y-white/20 border-r-white/20 bg-white/[0.08]" : "border-y-transparent border-r-transparent bg-transparent hover:bg-white/[0.035]"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[9px] text-zinc-600">{Math.round(note.distance)} m</span>
                    <span className="text-[8px] uppercase tracking-[0.16em] text-zinc-700">{noteKindLabel(note)}</span>
                  </div>
                  <p className={`mt-1 truncate text-xs font-medium ${active ? "text-white" : "text-zinc-400"}`}>{note.text}</p>
                  {curve ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <MiniChip label={`G${curve.severity}`} active />
                      {curve.length === "long" ? <MiniChip label="Larga" /> : null}
                      {curve.length === "very_long" ? <MiniChip label="Muy larga" /> : null}
                      {curve.line === "dont_cut" ? <MiniChip label="No cortar" /> : null}
                      {curve.warnings.includes("caution") ? <MiniChip label="Ojo" /> : null}
                    </div>
                  ) : null}
                </button>
              );
            }) : (
              <div className="p-8 text-center text-xs text-zinc-600">No hay notas que coincidan con el filtro.</div>
            )}
          </div>
        </div>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.08),transparent_38%),rgba(9,9,11,0.96)] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:p-5">
            <div className="flex flex-col gap-3 border-b border-zinc-800 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">{activeNote ? `${Math.round(activeNote.distance)} m · ${noteKindLabel(activeNote)}` : "Nota"}</p>
                <p className="mt-2 text-balance text-xl font-semibold leading-snug text-white sm:text-2xl">{activeNote?.text ?? "Selecciona una nota"}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button type="button" disabled={activeIndex <= 0} onClick={() => selectRelative(-1)} className="rounded-lg border border-zinc-800 px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-zinc-400 disabled:opacity-25">Anterior</button>
                <button type="button" disabled={activeIndex >= pacenotes.length - 1} onClick={() => selectRelative(1)} className="rounded-lg border border-zinc-800 px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-zinc-400 disabled:opacity-25">Siguiente</button>
              </div>
            </div>

            {activeNote ? (
              <ActiveNoteEditor
                note={activeNote}
                index={activeIndex}
                replaceStructured={replaceStructured}
                replaceText={replaceText}
                updateDistance={updateDistance}
                updateCurve={updateCurve}
                setSeverity={setSeverity}
                setModifier={setModifier}
                toggleWarning={toggleWarning}
                toggleContext={toggleContext}
                toggleRoadModifier={toggleRoadModifier}
                removeManualNote={removeManualNote}
                addCustomNote={addCustomNote}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveNoteEditor({
  note,
  index,
  replaceStructured,
  replaceText,
  updateDistance,
  updateCurve,
  setSeverity,
  setModifier,
  toggleWarning,
  toggleContext,
  toggleRoadModifier,
  removeManualNote,
  addCustomNote,
}: {
  note: RecceMindPacenote;
  index: number;
  replaceStructured: (index: number, structured: RecceMindStructuredPacenote) => void;
  replaceText: (index: number, text: string) => void;
  updateDistance: (index: number, value: string) => void;
  updateCurve: (index: number, structured: StructuredCurve, patch: Partial<StructuredCurve>) => void;
  setSeverity: (index: number, structured: StructuredCurve, severity: RecceMindSeverity) => void;
  setModifier: (index: number, structured: StructuredCurve, modifier: RecceMindModifier | null) => void;
  toggleWarning: (index: number, structured: StructuredCurve, warning: RecceMindWarning) => void;
  toggleContext: (index: number, structured: StructuredCurve, context: RecceMindContext) => void;
  toggleRoadModifier: (index: number, structured: StructuredCurve, modifier: RecceMindRoadModifier) => void;
  removeManualNote: (index: number) => void;
  addCustomNote: (label?: string) => void;
}) {
  if (note.type === "distance") {
    const structuredMeters = note.structured?.kind === "distance" ? note.structured.meters : Number(note.text);
    return (
      <div className="py-5">
        <p className="text-[9px] uppercase tracking-[0.22em] text-zinc-600">Distancia de enlace</p>
        <div className="mt-3 flex max-w-xs items-end gap-3">
          <input
            type="number"
            min={0}
            step={5}
            value={Number.isFinite(structuredMeters) ? Math.round(structuredMeters) : ""}
            onChange={(event) => updateDistance(index, event.target.value)}
            className="min-w-0 flex-1 rounded-2xl border border-zinc-700 bg-black/40 px-4 py-3 text-right font-mono text-3xl font-semibold text-white outline-none focus:border-white/40"
          />
          <span className="pb-3 text-sm text-zinc-500">m</span>
        </div>
        <p className="mt-3 max-w-lg text-xs leading-5 text-zinc-600">Esta distancia se utiliza en el PDF y en la lectura del copiloto. Puedes redondearla a la forma en que realmente cantaríais el tramo.</p>
      </div>
    );
  }

  const structured = note.structured;
  if (!structured || structured.kind !== "curve") {
    const canDelete = note.curve_index === null;
    return (
      <div className="space-y-5 py-5">
        <div>
          <p className="mb-2 text-[9px] uppercase tracking-[0.22em] text-zinc-600">Texto de la nota</p>
          <input
            value={note.text}
            onChange={(event) => replaceText(index, event.target.value)}
            className="w-full rounded-2xl border border-zinc-700 bg-black/35 px-4 py-3 text-lg font-medium text-white outline-none focus:border-white/40"
          />
        </div>
        <div>
          <p className="mb-2 text-[9px] uppercase tracking-[0.22em] text-zinc-600">Añadir rápidamente después</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_CUSTOM_NOTES.map((label) => <Toggle key={label} active={false} label={`+ ${label}`} onClick={() => addCustomNote(label)} />)}
          </div>
        </div>
        {canDelete ? (
          <button type="button" onClick={() => removeManualNote(index)} className="rounded-xl border border-red-400/20 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-red-300 transition hover:bg-red-400/10">
            Eliminar nota manual
          </button>
        ) : null}
      </div>
    );
  }

  const modifier = structured.modifiers[0] ?? null;
  const contexts = structured.contexts ?? [];
  const roadModifiers = structured.road_modifiers ?? [];

  return (
    <div className="space-y-5 pt-5">
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
        <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Curva</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <Control label="Dirección">
            <div className="grid grid-cols-2 gap-2">
              {(["left", "right"] as const).map((direction) => (
                <Choice key={direction} active={structured.direction === direction} label={direction === "left" ? "Izquierda" : "Derecha"} onClick={() => updateCurve(index, structured, { direction })} />
              ))}
            </div>
          </Control>

          <Control label="Grado de entrada">
            <div className="grid grid-cols-6 gap-1.5">
              {SEVERITIES.map((severity) => (
                <button key={severity} type="button" onClick={() => setSeverity(index, structured, severity)} className={`rounded-xl py-2.5 text-sm font-bold transition ${structured.severity === severity ? "bg-rose-500 text-white shadow-[0_0_0_1px_rgba(251,113,133,0.35)]" : "border border-zinc-800 bg-black/20 text-zinc-500 hover:border-zinc-600 hover:text-white"}`}>{severity}</button>
              ))}
            </div>
          </Control>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
        <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Forma de la curva</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <Control label="Evolución">
            <div className="grid grid-cols-3 gap-2">
              {([[null, "Constante"], ["tightens", "Cierra"], ["opens", "Abre"]] as const).map(([value, label]) => {
                const impossible = value === "tightens" ? structured.severity === 1 : value === "opens" ? structured.severity === 6 : false;
                return <Choice key={label} active={modifier === value} label={label} disabled={impossible} onClick={() => setModifier(index, structured, value)} />;
              })}
            </div>
          </Control>

          <Control label="Grado final">
            <div className={`grid grid-cols-6 gap-1.5 transition ${modifier ? "opacity-100" : "pointer-events-none opacity-25"}`}>
              {SEVERITIES.map((severity) => {
                const invalid = !modifier || (modifier === "tightens" ? severity >= structured.severity : severity <= structured.severity);
                return <button key={severity} type="button" disabled={invalid} onClick={() => updateCurve(index, structured, { target_severity: severity })} className={`rounded-xl py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-20 ${structured.target_severity === severity ? "bg-amber-400 text-black" : "border border-zinc-800 bg-black/20 text-zinc-500 hover:text-white"}`}>{severity}</button>;
              })}
            </div>
          </Control>

          <Control label="Longitud">
            <div className="grid grid-cols-3 gap-2">
              <Choice active={structured.length === "standard"} label="Normal" onClick={() => updateCurve(index, structured, { length: "standard" })} />
              <Choice active={structured.length === "long"} label="Larga" onClick={() => updateCurve(index, structured, { length: "long" })} />
              <Choice active={structured.length === "very_long"} label="Muy larga" onClick={() => updateCurve(index, structured, { length: "very_long" })} />
            </div>
          </Control>

          <Control label="Trazada">
            <div className="grid grid-cols-3 gap-2">
              <Choice active={!structured.line} label="Normal" onClick={() => updateCurve(index, structured, { line: undefined })} />
              <Choice active={structured.line === "cut"} label="Cortar" onClick={() => updateCurve(index, structured, { line: "cut" })} />
              <Choice active={structured.line === "dont_cut"} label="No cortar" onClick={() => updateCurve(index, structured, { line: "dont_cut" })} />
            </div>
          </Control>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
        <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Referencias y avisos</p>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[9px] uppercase tracking-[0.2em] text-zinc-600">Entorno</p>
            <div className="flex flex-wrap gap-2">
              <Toggle active={contexts.includes("crest")} label="En rasante" onClick={() => toggleContext(index, structured, "crest")} />
              <Toggle active={contexts.includes("junction")} label="En cruce" onClick={() => toggleContext(index, structured, "junction")} />
              <Toggle active={contexts.includes("barrier")} label="En valla" onClick={() => toggleContext(index, structured, "barrier")} />
              <Toggle active={roadModifiers.includes("narrows")} label="Se estrecha" onClick={() => toggleRoadModifier(index, structured, "narrows")} />
            </div>
          </div>

          <div>
            <p className="mb-2 text-[9px] uppercase tracking-[0.2em] text-zinc-600">Prioridad</p>
            <div className="flex flex-wrap gap-2">
              <Toggle active={structured.warnings.includes("caution")} label="Ojo" onClick={() => toggleWarning(index, structured, "caution")} />
              <Toggle active={structured.warnings.includes("brake")} label="Frena" onClick={() => toggleWarning(index, structured, "brake")} />
              <label className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-black/20 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                Marcha
                <select value={structured.gear ?? ""} onChange={(event) => updateCurve(index, structured, { gear: event.target.value ? Number(event.target.value) : undefined })} className="bg-transparent text-zinc-100 outline-none">
                  <option value="">—</option>
                  {[1, 2, 3, 4, 5, 6].map((gear) => <option key={gear} value={gear} className="bg-zinc-950">{gear}</option>)}
                </select>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-zinc-800 p-4">
        <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Nota manual después de esta llamada</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK_CUSTOM_NOTES.map((label) => <Toggle key={label} active={false} label={`+ ${label}`} onClick={() => addCustomNote(label)} />)}
        </div>
      </section>
    </div>
  );
}

function Control({ label, children }: { label: string; children: ReactNode }) {
  return <div><p className="mb-2 text-[9px] uppercase tracking-[0.2em] text-zinc-600">{label}</p>{children}</div>;
}

function Choice({ active, label, onClick, disabled = false }: { active: boolean; label: string; onClick: () => void; disabled?: boolean }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={`rounded-xl px-2 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition disabled:cursor-not-allowed disabled:opacity-25 ${active ? "bg-white text-black shadow-sm" : "border border-zinc-800 bg-black/20 text-zinc-500 hover:border-zinc-600 hover:text-white"}`}>{label}</button>;
}

function Toggle({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-xl border px-3 py-2 text-[10px] uppercase tracking-[0.13em] transition ${active ? "border-rose-400/40 bg-rose-400/15 text-rose-100" : "border-zinc-800 bg-black/20 text-zinc-500 hover:border-zinc-600 hover:text-white"}`}>{label}</button>;
}

function MiniChip({ label, active = false }: { label: string; active?: boolean }) {
  return <span className={`rounded-md px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-[0.1em] ${active ? "bg-white/10 text-zinc-300" : "bg-zinc-900 text-zinc-600"}`}>{label}</span>;
}
