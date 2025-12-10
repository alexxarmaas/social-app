"use client";

import { useEffect, useState } from "react";
import { MdLocationOn, MdDirectionsRun } from "react-icons/md";

interface Stop {
    id: string;
    name: string;
    address?: string | null;
    latitude: number;
    longitude: number;
    order: number;
}

interface RouteDisplayProps {
    route?: {
        id: string;
        title?: string | null;
        distance?: number | null;
        duration?: number | null;
        stops: Stop[];
    };
}

export default function RouteDisplay({ route }: RouteDisplayProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!route || !route.stops || route.stops.length === 0) {
        return null;
    }

    if (!mounted) {
        return <div className="h-[300px] bg-slate-800 animate-pulse rounded-xl" />;
    }

    return (
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
                <MdDirectionsRun className="text-red-500" size={24} />
                <h2 className="text-xl font-bold text-white">
                    {route.title || "Ruta del Evento"}
                </h2>
            </div>

            {/* Stops List */}
            <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-300 mb-3">Paradas</h3>
                {route.stops.map((stop, idx) => (
                    <div key={stop.id} className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-lg">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">
                                {idx + 1}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{stop.name}</p>
                            {stop.address && (
                                <p className="text-slate-400 text-xs truncate flex items-center gap-1 mt-1">
                                    <MdLocationOn size={12} />
                                    {stop.address}
                                </p>
                            )}
                            <p className="text-slate-500 text-xs mt-1">
                                {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Route Stats */}
            {(route.distance || route.duration) && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                    {route.distance && (
                        <div className="text-center">
                            <p className="text-slate-400 text-xs">Distancia</p>
                            <p className="text-white font-bold text-lg">{route.distance.toFixed(1)} km</p>
                        </div>
                    )}
                    {route.duration && (
                        <div className="text-center">
                            <p className="text-slate-400 text-xs">Duración Estimada</p>
                            <p className="text-white font-bold text-lg">{Math.round(route.duration)} min</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
