"use client";

import { MdClose, MdLocationOn, MdCalendarToday, MdAccessTime, MdPeople, MdMap, MdDirections } from "react-icons/md";
import Image from "next/image";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import("react-leaflet").then((mod) => mod.Marker),
    { ssr: false }
);

interface EventDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: any;
}

export default function EventDetailsModal({ isOpen, onClose, event }: EventDetailsModalProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isOpen || !event) return null;

    const date = new Date(event.startDate);
    const formattedDate = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const formattedTime = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const handleGetDirections = () => {
        if (event.latitude && event.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`, '_blank');
        } else {
            // Fallback to searching by location name
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-800 shadow-2xl relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                    <MdClose size={24} />
                </button>

                {/* Header Image */}
                <div className="relative h-48 md:h-64 w-full bg-slate-800">
                    {event.imageUrl ? (
                        <Image src={event.imageUrl} alt={event.title} fill className="object-cover" unoptimized />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-slate-800 to-slate-900">
                            🗓️
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-6 pt-20">
                        <div className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-2 uppercase tracking-wider">
                            {event.eventType}
                        </div>
                        <h2 className="text-3xl font-bold text-white font-aeroblade tracking-wide leading-tight shadow-black drop-shadow-lg">
                            {event.title}
                        </h2>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 text-slate-300">
                                <MdCalendarToday className="text-red-500 mt-1 flex-shrink-0" size={20} />
                                <div>
                                    <p className="font-bold text-white">Fecha</p>
                                    <p className="capitalize">{formattedDate}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-slate-300">
                                <MdAccessTime className="text-red-500 mt-1 flex-shrink-0" size={20} />
                                <div>
                                    <p className="font-bold text-white">Hora</p>
                                    <p>{formattedTime}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-slate-300">
                                <MdPeople className="text-red-500 mt-1 flex-shrink-0" size={20} />
                                <div>
                                    <p className="font-bold text-white">Asistentes</p>
                                    <p>
                                        {event._count?.attendees || 0}
                                        {event.maxAttendees ? ` / ${event.maxAttendees}` : ""} confirmados
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 text-slate-300">
                                <MdLocationOn className="text-red-500 mt-1 flex-shrink-0" size={20} />
                                <div>
                                    <p className="font-bold text-white">Ubicación</p>
                                    <p>{event.location}</p>
                                    {event.address && <p className="text-sm text-slate-400">{event.address}</p>}
                                </div>
                            </div>

                            <button
                                onClick={handleGetDirections}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <MdDirections size={20} />
                                Cómo llegar
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <MdDirections className="text-slate-400" />
                            Descripción
                        </h3>
                        <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {event.description || "Sin descripción disponible."}
                        </p>
                    </div>

                    {/* Map Preview */}
                    {event.latitude && event.longitude && isMounted && (
                        <div className="h-48 w-full rounded-xl overflow-hidden border border-slate-700 relative z-0">
                            <MapContainer
                                center={[event.latitude, event.longitude]}
                                zoom={14}
                                scrollWheelZoom={false}
                                className="w-full h-full"
                                dragging={false}
                                zoomControl={false}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[event.latitude, event.longitude]} />
                            </MapContainer>

                            {/* Overlay to make it clickable to open directions */}
                            <div
                                onClick={handleGetDirections}
                                className="absolute inset-0 bg-black/0 hover:bg-black/10 cursor-pointer transition-colors flex items-center justify-center group z-[1000]"
                                title="Abrir en Google Maps"
                            >
                                <div className="bg-white/90 text-black px-3 py-1 rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 shadow-lg transform translate-y-2 group-hover:translate-y-0">
                                    <MdMap /> Ver en Mapa
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
