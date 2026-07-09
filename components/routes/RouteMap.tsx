"use client";

import dynamic from "next/dynamic";
import type { RouteCoordinate } from "@/app/lib/tramassso-content";

const RouteMapInner = dynamic(() => import("@/components/routes/RouteMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[28rem] items-center justify-center rounded-[2rem] border border-zinc-800 bg-zinc-900/70 text-xs uppercase tracking-[0.35em] text-zinc-500">
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
      <div className="flex h-[28rem] items-center justify-center rounded-[2rem] border border-dashed border-zinc-800 bg-white/5 px-5 text-center">
        <p className="text-sm text-zinc-400">Mapa no disponible para esta ruta.</p>
      </div>
    );
  }

  return <RouteMapInner coordinates={coordinates} />;
}
