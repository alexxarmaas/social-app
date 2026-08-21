"use client";

import dynamic from "next/dynamic";
import type { RecceMindCoordinate } from "@/app/lib/reccemind";

const RoutePointPickerInner = dynamic(() => import("@/components/reccemind/RoutePointPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[20rem] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-xs uppercase tracking-[0.25em] text-zinc-600">
      Cargando selector de mapa
    </div>
  ),
});

interface Props {
  origin: RecceMindCoordinate | null;
  destination: RecceMindCoordinate | null;
  onChange: (origin: RecceMindCoordinate | null, destination: RecceMindCoordinate | null) => void;
}

function coordinateLabel(point: RecceMindCoordinate | null) {
  return point ? `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}` : "Pendiente";
}

export default function RoutePointPicker({ origin, destination, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-5 text-zinc-500">
          {!origin ? "Pulsa la salida en el mapa." : !destination ? "Ahora pulsa la meta." : "Salida y meta listas. Un nuevo clic reinicia la selección."}
        </p>
        <button type="button" onClick={() => onChange(null, null)} className="rounded-full border border-zinc-700 px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] text-zinc-400 hover:border-white/30 hover:text-white">
          Limpiar
        </button>
      </div>
      <RoutePointPickerInner origin={origin} destination={destination} onChange={onChange} />
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2">
          <p className="text-[9px] uppercase tracking-[0.2em] text-emerald-300/70">Salida</p>
          <p className="mt-1 font-mono text-xs text-zinc-300">{coordinateLabel(origin)}</p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2">
          <p className="text-[9px] uppercase tracking-[0.2em] text-red-300/70">Meta</p>
          <p className="mt-1 font-mono text-xs text-zinc-300">{coordinateLabel(destination)}</p>
        </div>
      </div>
    </div>
  );
}
