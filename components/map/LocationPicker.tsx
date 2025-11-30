"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { useState, useEffect } from "react";

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    initialLat?: number;
    initialLng?: number;
}

function LocationMarker({ onLocationSelect, initialPosition }: { onLocationSelect: (lat: number, lng: number) => void, initialPosition: [number, number] | null }) {
    const [position, setPosition] = useState<[number, number] | null>(initialPosition);

    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
    const defaultCenter: [number, number] = [40.416775, -3.703790]; // Madrid
    const initialPosition: [number, number] | null = initialLat && initialLng ? [initialLat, initialLng] : null;

    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border border-slate-700 relative z-0">
            <MapContainer center={initialPosition || defaultCenter} zoom={6} scrollWheelZoom={true} className="w-full h-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker onLocationSelect={onLocationSelect} initialPosition={initialPosition} />
            </MapContainer>
            <div className="absolute bottom-2 left-2 bg-white/90 p-2 rounded text-xs text-black z-[1000]">
                Haz clic en el mapa para seleccionar la ubicación
            </div>
        </div>
    );
}
