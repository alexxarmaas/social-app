"use client";

import { CircleMarker, MapContainer, TileLayer, Tooltip, useMapEvents } from "react-leaflet";
import type { RecceMindCoordinate } from "@/app/lib/reccemind";

interface Props {
  origin: RecceMindCoordinate | null;
  destination: RecceMindCoordinate | null;
  onChange: (origin: RecceMindCoordinate | null, destination: RecceMindCoordinate | null) => void;
}

function ClickCapture({ origin, destination, onChange }: Props) {
  useMapEvents({
    click(event) {
      const point = { lat: event.latlng.lat, lng: event.latlng.lng };
      if (!origin) {
        onChange(point, null);
      } else if (!destination) {
        onChange(origin, point);
      } else {
        onChange(point, null);
      }
    },
  });
  return null;
}

export default function RoutePointPickerInner({ origin, destination, onChange }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
      <MapContainer center={[28.12, -15.55]} zoom={10} scrollWheelZoom className="h-[20rem] w-full bg-zinc-950">
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ClickCapture origin={origin} destination={destination} onChange={onChange} />
        {origin ? (
          <CircleMarker center={[origin.lat, origin.lng]} radius={9} pathOptions={{ color: "#22c55e", fillColor: "#22c55e", fillOpacity: 0.9, weight: 3 }}>
            <Tooltip permanent direction="top">Salida</Tooltip>
          </CircleMarker>
        ) : null}
        {destination ? (
          <CircleMarker center={[destination.lat, destination.lng]} radius={9} pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.9, weight: 3 }}>
            <Tooltip permanent direction="top">Meta</Tooltip>
          </CircleMarker>
        ) : null}
      </MapContainer>
    </div>
  );
}
