"use client";

import { useState } from "react";

export interface KmzTrackSummary {
  index: number;
  name: string;
  pointCount: number;
}

interface KmzInspectionResponse {
  tracks?: KmzTrackSummary[];
  defaultTrackIndex?: number;
  error?: string;
  detail?: string;
}

interface KmzTrackPickerProps {
  file: File | null;
  selectedTrackIndex: number | null;
  onFileChange: (file: File | null) => void;
  onTrackChange: (index: number | null, name: string | null) => void;
}

export default function KmzTrackPicker({
  file,
  selectedTrackIndex,
  onFileChange,
  onTrackChange,
}: KmzTrackPickerProps) {
  const [tracks, setTracks] = useState<KmzTrackSummary[]>([]);
  const [inspecting, setInspecting] = useState(false);
  const [inspectionError, setInspectionError] = useState<string | null>(null);

  const inspectFile = async (nextFile: File | null) => {
    onFileChange(nextFile);
    setTracks([]);
    setInspectionError(null);
    onTrackChange(null, null);

    if (!nextFile) return;
    if (nextFile.size > 10 * 1024 * 1024) {
      setInspectionError("El KMZ no puede superar 10 MB.");
      return;
    }

    setInspecting(true);
    try {
      const formData = new FormData();
      formData.append("file", nextFile);
      const response = await fetch("/api/reccemind/inspect-kmz", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as KmzInspectionResponse;
      if (!response.ok) {
        throw new Error(payload.error || payload.detail || "No se pudo inspeccionar el KMZ.");
      }

      const nextTracks = payload.tracks ?? [];
      setTracks(nextTracks);
      if (!nextTracks.length) {
        setInspectionError("El KMZ no contiene trazados seleccionables.");
        return;
      }

      const preferred = nextTracks.find((track) => track.index === payload.defaultTrackIndex) ?? nextTracks[0];
      onTrackChange(preferred.index, preferred.name);
    } catch (error) {
      setInspectionError(error instanceof Error ? error.message : "No se pudo inspeccionar el KMZ.");
    } finally {
      setInspecting(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">Archivo KMZ (VMRM / Google Earth)</span>
        <input
          type="file"
          accept=".kmz,application/vnd.google-earth.kmz"
          onChange={(event) => void inspectFile(event.target.files?.[0] ?? null)}
          className="rounded-2xl border border-dashed border-zinc-700 bg-black/40 px-4 py-6 text-sm text-zinc-400"
        />
        <span className="text-xs leading-5 text-zinc-600">
          {file ? file.name : "Importa un KMZ y elige qué trazado analizar."}
        </span>
      </label>

      {inspecting ? (
        <div className="rounded-xl border border-sky-400/20 bg-sky-400/[0.06] px-3 py-2 text-xs text-sky-200">
          Detectando trazados del KMZ…
        </div>
      ) : null}

      {inspectionError ? (
        <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-200">
          {inspectionError}
        </div>
      ) : null}

      {tracks.length ? (
        <div className="rounded-2xl border border-zinc-800 bg-black/25 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[9px] uppercase tracking-[0.22em] text-zinc-600">Trazados encontrados</p>
            <span className="text-[10px] text-zinc-600">{tracks.length}</span>
          </div>
          <div className="space-y-1.5">
            {tracks.map((track) => (
              <button
                key={`${track.index}-${track.name}`}
                type="button"
                onClick={() => onTrackChange(track.index, track.name)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition ${selectedTrackIndex === track.index ? "border-sky-400/40 bg-sky-400/10 text-sky-100" : "border-zinc-800 bg-black/20 text-zinc-400 hover:border-zinc-600 hover:text-white"}`}
              >
                <span className="min-w-0 truncate text-xs font-medium">{track.name || `Trazado ${track.index + 1}`}</span>
                <span className="shrink-0 font-mono text-[9px] text-zinc-600">{track.pointCount} pts</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
