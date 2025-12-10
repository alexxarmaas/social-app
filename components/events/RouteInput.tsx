"use client";

import { useState } from "react";
import { MdAdd, MdDelete, MdLocationOn, MdMap, MdClose } from "react-icons/md";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";

const LocationPicker = dynamic(() => import("@/components/map/LocationPicker"), {
    ssr: false,
    loading: () => <div className="h-[300px] bg-slate-800 animate-pulse rounded-xl" />
});

interface Stop {
    id: string;
    name: string;
    address?: string;
    latitude: number;
    longitude: number;
    order: number;
}

interface RouteInputProps {
    onRouteChange: (route: { stops: Stop[]; title?: string }) => void;
    initialRoute?: { stops: Stop[]; title?: string };
}

export default function RouteInput({ onRouteChange, initialRoute }: RouteInputProps) {
    const [stops, setStops] = useState<Stop[]>(initialRoute?.stops || []);
    const [routeTitle, setRouteTitle] = useState(initialRoute?.title || "");
    const [showMap, setShowMap] = useState(false);
    const [newStopName, setNewStopName] = useState("");
    const [newStopAddress, setNewStopAddress] = useState("");
    const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

    const handleAddStop = () => {
        if (!newStopName.trim()) {
            toast.error("Ingresa el nombre de la parada");
            return;
        }

        if (!selectedCoords) {
            toast.error("Selecciona una ubicación en el mapa");
            return;
        }

        const newStop: Stop = {
            id: Math.random().toString(36),
            name: newStopName,
            address: newStopAddress,
            latitude: selectedCoords.lat,
            longitude: selectedCoords.lng,
            order: stops.length
        };

        const updatedStops = [...stops, newStop];
        setStops(updatedStops);
        onRouteChange({ stops: updatedStops, title: routeTitle });

        setNewStopName("");
        setNewStopAddress("");
        setSelectedCoords(null);
        toast.success("Parada agregada");
    };

    const handleRemoveStop = (id: string) => {
        const updatedStops = stops.filter(s => s.id !== id).map((s, idx) => ({
            ...s,
            order: idx
        }));
        setStops(updatedStops);
        onRouteChange({ stops: updatedStops, title: routeTitle });
    };

    const handleRouteTitleChange = (title: string) => {
        setRouteTitle(title);
        onRouteChange({ stops, title });
    };

    const handleMapClick = (lat: number, lng: number) => {
        setSelectedCoords({ lat, lng });
        toast.success("Ubicación seleccionada");
    };

    return (
        <div className="space-y-4">
            {/* Route Title */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Nombre de la Ruta</label>
                <input
                    type="text"
                    value={routeTitle}
                    onChange={(e) => handleRouteTitleChange(e.target.value)}
                    placeholder="ej: Ruta Costanera, Ruta Montaña..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
                />
            </div>

            {/* Current Stops List */}
            {stops.length > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                    <h4 className="text-sm font-bold text-white">Paradas ({stops.length})</h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {stops.map((stop, idx) => (
                            <div key={stop.id} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 text-white font-medium">
                                        <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full font-bold">
                                            {idx + 1}
                                        </span>
                                        {stop.name}
                                    </div>
                                    {stop.address && (
                                        <p className="text-xs text-slate-400 mt-1 ml-6">{stop.address}</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveStop(stop.id)}
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                    <MdDelete size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Stop Section */}
            <div className="bg-slate-800/30 rounded-lg p-4 border border-dashed border-slate-700 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <MdAdd size={18} /> Agregar Parada
                </h4>

                <input
                    type="text"
                    value={newStopName}
                    onChange={(e) => setNewStopName(e.target.value)}
                    placeholder="Nombre de la parada"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
                />

                <input
                    type="text"
                    value={newStopAddress}
                    onChange={(e) => setNewStopAddress(e.target.value)}
                    placeholder="Dirección (opcional)"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
                />

                {selectedCoords && (
                    <div className="text-xs text-green-400 flex items-center gap-1">
                        <MdLocationOn size={14} />
                        Ubicación: {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setShowMap(!showMap)}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <MdMap size={16} />
                        {showMap ? "Ocultar Mapa" : "Seleccionar Ubicación"}
                    </button>
                    <button
                        type="button"
                        onClick={handleAddStop}
                        disabled={!newStopName.trim() || !selectedCoords}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <MdAdd size={16} />
                        Agregar
                    </button>
                </div>

                {/* Map for selecting location */}
                {showMap && (
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowMap(false)}
                            className="absolute top-2 right-2 z-10 bg-slate-900/80 text-white p-1 rounded-full hover:bg-red-600"
                        >
                            <MdClose size={16} />
                        </button>
                        <LocationPicker
                            onLocationSelect={handleMapClick}
                            initialLat={selectedCoords?.lat}
                            initialLng={selectedCoords?.lng}
                        />
                    </div>
                )}
            </div>

            {/* Route Preview Info */}
            {stops.length > 0 && (
                <div className="bg-slate-800/30 rounded-lg p-3 text-xs text-slate-400 border-l-2 border-red-500">
                    <p>✓ Ruta con {stops.length} parada{stops.length !== 1 ? "s" : ""} configurada</p>
                </div>
            )}
        </div>
    );
}
