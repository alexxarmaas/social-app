"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";
import { latLngBounds, type LatLngExpression } from "leaflet";
import type { RouteCoordinate } from "@/app/lib/tramassso-content";

interface RouteMapInnerProps {
  coordinates: RouteCoordinate[];
}

function FitBounds({ positions }: { positions: LatLngExpression[] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length < 2) {
      return;
    }

    map.fitBounds(latLngBounds(positions), {
      padding: [28, 28],
      maxZoom: 15,
    });
  }, [map, positions]);

  return null;
}

export default function RouteMapInner({ coordinates }: RouteMapInnerProps) {
  const positions = useMemo<LatLngExpression[]>(
    () => coordinates.map((coordinate) => [coordinate.lat, coordinate.lng]),
    [coordinates],
  );

  const fallbackCenter: LatLngExpression = [28.1234, -15.4321];
  const center: LatLngExpression = positions[0] ?? fallbackCenter;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
      <MapContainer center={center} zoom={12} scrollWheelZoom className="h-[28rem] w-full bg-zinc-950">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Polyline positions={positions} pathOptions={{ color: "#f4f4f5", weight: 5, opacity: 0.95, lineCap: "round", lineJoin: "round" }} />
        <FitBounds positions={positions} />
      </MapContainer>
    </div>
  );
}
