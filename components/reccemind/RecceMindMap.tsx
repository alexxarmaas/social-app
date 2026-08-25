"use client";

import dynamic from "next/dynamic";
import type { RecceMindCoordinate, RecceMindCurve } from "@/app/lib/reccemind";

const RecceMindMapInner = dynamic(() => import("@/components/reccemind/RecceMindMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[22rem] items-center justify-center rounded-[2rem] border border-zinc-800 bg-zinc-950 text-xs uppercase tracking-[0.3em] text-zinc-600 sm:h-[32rem]">
      Cargando mapa de tramo
    </div>
  ),
});

interface RecceMindMapProps {
  coordinates: RecceMindCoordinate[];
  curves: RecceMindCurve[];
  selectedCurveIndex: number | null;
  onSelectCurve: (index: number | null) => void;
  liveCoordinates?: RecceMindCoordinate[];
  playhead?: RecceMindCoordinate | null;
  followPlayhead?: boolean;
}

export default function RecceMindMap(props: RecceMindMapProps) {
  if (props.coordinates.length < 2 && (!props.liveCoordinates || props.liveCoordinates.length < 2)) {
    return null;
  }
  return <RecceMindMapInner {...props} />;
}
