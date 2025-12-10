"use client";

import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { useEffect } from "react";

type Stop = {
    id: string;
    name: string;
    address?: string | null;
    latitude: number;
    longitude: number;
    order: number;
};

interface RouteMapProps {
    stops: Stop[];
}

const defaultCenter: [number, number] = [40.416775, -3.70379]; // Madrid fallback

function FitBounds({ stops }: { stops: Stop[] }) {
    const map = useMap();

    useEffect(() => {
        if (!stops.length) return;
        if (stops.length === 1) {
            map.setView([stops[0].latitude, stops[0].longitude], 12);
            return;
        }
        const bounds = stops.map((s) => [s.latitude, s.longitude]) as [number, number][];
        map.fitBounds(bounds, { padding: [40, 40] });
    }, [map, stops]);

    return null;
}

export default function RouteMap({ stops }: RouteMapProps) {
    const positions = stops.map((s) => [s.latitude, s.longitude]) as [number, number][];

    return (
        <div className="h-[320px] w-full rounded-xl overflow-hidden border border-slate-800">
            <MapContainer
                center={positions[0] ?? defaultCenter}
                zoom={12}
                scrollWheelZoom
                className="w-full h-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {positions.length > 1 && (
                    <Polyline positions={positions} pathOptions={{ color: "#ef4444", weight: 5, opacity: 0.8 }} />
                )}

                {stops.map((stop, idx) => (
                    <Marker key={stop.id} position={[stop.latitude, stop.longitude]}>
                        <Popup>
                            <div className="text-sm">
                                <p className="font-bold">{idx + 1}. {stop.name}</p>
                                {stop.address && <p className="text-slate-600 text-xs">{stop.address}</p>}
                                <p className="text-xs text-slate-500">{stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <FitBounds stops={stops} />
            </MapContainer>
        </div>
    );
}
