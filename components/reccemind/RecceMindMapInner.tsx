"use client";

import { Fragment, useEffect, useMemo } from "react";
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { latLngBounds, type LatLngExpression } from "leaflet";
import type { RecceMindCoordinate, RecceMindCurve } from "@/app/lib/reccemind";

interface Props {
  coordinates: RecceMindCoordinate[];
  curves: RecceMindCurve[];
  selectedCurveIndex: number | null;
  onSelectCurve: (index: number | null) => void;
  liveCoordinates?: RecceMindCoordinate[];
}

function FitBounds({ positions }: { positions: LatLngExpression[] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length < 2) return;
    map.fitBounds(latLngBounds(positions), { padding: [28, 28], maxZoom: 16 });
  }, [map, positions]);
  return null;
}

function FocusCurve({ coordinate }: { coordinate: LatLngExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (!coordinate) return;
    map.flyTo(coordinate, Math.max(map.getZoom(), 16), { duration: 0.7 });
  }, [coordinate, map]);
  return null;
}

export default function RecceMindMapInner({ coordinates, curves, selectedCurveIndex, onSelectCurve, liveCoordinates = [] }: Props) {
  const positions = useMemo<LatLngExpression[]>(() => coordinates.map((point) => [point.lat, point.lng]), [coordinates]);
  const livePositions = useMemo<LatLngExpression[]>(() => liveCoordinates.map((point) => [point.lat, point.lng]), [liveCoordinates]);
  const fallbackCenter: LatLngExpression = [28.1234, -15.4321];
  const center = positions[0] ?? livePositions[0] ?? fallbackCenter;

  const selectedMidpoint = useMemo<LatLngExpression | null>(() => {
    if (selectedCurveIndex === null) return null;
    const curve = curves[selectedCurveIndex];
    if (!curve) return null;
    const mid = Math.floor((curve.start_idx + curve.end_idx) / 2);
    const point = coordinates[mid];
    return point ? [point.lat, point.lng] : null;
  }, [coordinates, curves, selectedCurveIndex]);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
      <MapContainer center={center} zoom={12} scrollWheelZoom className="h-[22rem] w-full bg-zinc-950 sm:h-[32rem]">
        <TileLayer attribution='&copy; OpenStreetMap &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        {positions.length > 1 ? <Polyline positions={positions} pathOptions={{ color: "#71717a", weight: 4, opacity: 0.8 }} /> : null}
        {curves.map((curve, index) => {
          const section = coordinates.slice(curve.start_idx, curve.end_idx + 1).map((point) => [point.lat, point.lng] as LatLngExpression);
          if (section.length < 2) return null;
          const selected = selectedCurveIndex === index;
          const midIndex = Math.floor((curve.start_idx + curve.end_idx) / 2);
          const midpoint = coordinates[midIndex];
          return (
            <Fragment key={`${curve.start_idx}-${curve.end_idx}-${index}`}>
              <Polyline
                positions={section}
                pathOptions={{ color: selected ? "#facc15" : curve.direction.toLowerCase().includes("derecha") ? "#ef4444" : "#3b82f6", weight: selected ? 8 : 6, opacity: 0.95 }}
                eventHandlers={{ click: () => onSelectCurve(index) }}
              />
              {midpoint ? (
                <CircleMarker center={[midpoint.lat, midpoint.lng]} radius={selected ? 8 : 6} pathOptions={{ color: selected ? "#facc15" : "#fafafa", fillColor: "#09090b", fillOpacity: 1, weight: 2 }} eventHandlers={{ click: () => onSelectCurve(index) }}>
                  <Popup>
                    <div className="min-w-44 text-sm">
                      <strong>{curve.direction} {curve.entry_classification ?? curve.classification}{curve.exit_classification && curve.exit_classification !== (curve.entry_classification ?? curve.classification) ? ` → ${curve.exit_classification}` : ""}</strong>
                      <div>Radio: {Math.round(curve.radius)} m</div>
                      <div>Longitud: {Math.round(curve.length)} m</div>
                      <div>Giro: {Math.round(Math.abs(curve.heading_change))}°</div>
                      <a className="mt-2 inline-block font-semibold underline" href={`https://www.google.com/maps/search/?api=1&query=${midpoint.lat},${midpoint.lng}`} target="_blank" rel="noreferrer">Abrir en Google Maps</a>
                    </div>
                  </Popup>
                </CircleMarker>
              ) : null}
            </Fragment>
          );
        })}
        {livePositions.length > 1 ? <Polyline positions={livePositions} pathOptions={{ color: "#22c55e", weight: 5, opacity: 0.95 }} /> : null}
        <FitBounds positions={positions.length > 1 ? positions : livePositions} />
        <FocusCurve coordinate={selectedMidpoint} />
      </MapContainer>
    </div>
  );
}
