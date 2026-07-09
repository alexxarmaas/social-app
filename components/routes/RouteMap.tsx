"use client";

import dynamic from "next/dynamic";
import type { RouteCoordinate } from "@/app/lib/tramassso-content";

const RouteMapInner = dynamic(() => import("@/components/routes/RouteMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[18rem] items-center justify-center rounded-[1.5rem] border border-zinc-800 bg-zinc-900/70 text-[10px] uppercase tracking-[0.24em] text-zinc-500 sm:h-[28rem] sm:rounded-[2rem] sm:text-xs sm:tracking-[0.35em]">
      Cargando mapa
    </div>
  ),
});

interface RouteMapProps {
  coordinates: RouteCoordinate[] | null;
}

export default function RouteMap({ coordinates }: RouteMapProps) {
  if (!coordinates || coordinates.length < 2) {
    return (
      <div className="flex h-[18rem] items-center justify-center rounded-[1.5rem] border border-dashed border-zinc-800 bg-white/5 px-5 text-center sm:h-[28rem] sm:rounded-[2rem]">
        <p className="text-sm text-zinc-400">Mapa no disponible para esta ruta.</p>
      </div>
    );
  }

  return <RouteMapInner coordinates={coordinates} />;
}
