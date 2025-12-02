"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import L from "leaflet";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MdMyLocation, MdFilterList } from "react-icons/md";

// Custom Icons
const eventIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const storeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapProps {
    events?: any[];
    stores?: any[];
}

export default function Map({ events = [], stores = [] }: MapProps) {
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [radius, setRadius] = useState(50); // km
    const [filteredEvents, setFilteredEvents] = useState(events);
    const [filteredStores, setFilteredStores] = useState(stores);
    const [showFilters, setShowFilters] = useState(false);

    // Default center (e.g., Madrid, Spain)
    const defaultCenter: [number, number] = [40.416775, -3.703790];

    useEffect(() => {
        if (userLocation) {
            const filteredE = events.filter(event => {
                if (!event.latitude || !event.longitude) return false;
                const dist = calculateDistance(userLocation.lat, userLocation.lng, event.latitude, event.longitude);
                return dist <= radius;
            });
            setFilteredEvents(filteredE);

            const filteredS = stores.filter(store => {
                if (!store.latitude || !store.longitude) return false;
                const dist = calculateDistance(userLocation.lat, userLocation.lng, store.latitude, store.longitude);
                return dist <= radius;
            });
            setFilteredStores(filteredS);
        } else {
            setFilteredEvents(events);
            setFilteredStores(stores);
        }
    }, [userLocation, radius, events, stores]);

    const handleGetUserLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            }, (error) => {
                console.error("Error getting location:", error);
                alert("No se pudo obtener tu ubicación. Asegúrate de dar permisos.");
            });
        } else {
            alert("Geolocalización no soportada por este navegador.");
        }
    };

    // Haversine formula to calculate distance in km
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    };

    return (
        <div className="relative w-full h-full">
            <MapContainer center={defaultCenter} zoom={6} scrollWheelZoom={true} className="w-full h-full rounded-xl z-0">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Location & Radius */}
                {userLocation && (
                    <>
                        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                            <Popup>Tu ubicación</Popup>
                        </Marker>
                        <Circle
                            center={[userLocation.lat, userLocation.lng]}
                            radius={radius * 1000} // meters
                            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
                        />
                    </>
                )}

                {/* Events */}
                {filteredEvents.map((event) => (
                    event.latitude && event.longitude && (
                        <Marker key={`event-${event.id}`} position={[event.latitude, event.longitude]} icon={eventIcon}>
                            <Popup>
                                <div className="min-w-[200px]">
                                    <div className="relative h-32 w-full mb-2 rounded overflow-hidden">
                                        {event.imageUrl ? (
                                            <Image src={event.imageUrl} alt={event.title} fill className="object-fill" unoptimized />
                                        ) : (
                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-2xl">🗓️</div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                            Evento
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{new Date(event.startDate).toLocaleDateString()}</p>
                                    <Link href={`/events/${event.id}`} className="block text-center bg-red-500 text-white py-1 rounded text-sm font-bold hover:bg-red-600">
                                        Ver Detalles
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}

                {/* Stores */}
                {filteredStores.map((store) => (
                    store.latitude && store.longitude && (
                        <Marker key={`store-${store.id}`} position={[store.latitude, store.longitude]} icon={storeIcon}>
                            <Popup>
                                <div className="min-w-[200px]">
                                    <div className="relative h-32 w-full mb-2 rounded overflow-hidden">
                                        {store.banner ? (
                                            <Image src={store.banner} alt={store.name} fill className="object-fill" unoptimized />
                                        ) : (
                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-2xl">🏪</div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                            Tienda
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">{store.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{store.description}</p>
                                    <Link href={`/marketplace?store=${store.id}`} className="block text-center bg-blue-500 text-white py-1 rounded text-sm font-bold hover:bg-blue-600">
                                        Visitar Tienda
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>

            {/* Controls */}
            <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-4 items-end">
                {/* Filter Panel */}
                {showFilters && (
                    <div className="bg-white p-4 rounded-xl shadow-xl w-64 animate-in slide-in-from-bottom-5 fade-in duration-200">
                        <h3 className="font-bold text-gray-800 mb-3">Filtrar por distancia</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Radio</span>
                                    <span className="font-bold">{radius} km</span>
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="500"
                                    step="10"
                                    value={radius}
                                    onChange={(e) => setRadius(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                            {!userLocation && (
                                <p className="text-xs text-red-500">
                                    Activa tu ubicación para filtrar.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-3 rounded-full shadow-lg transition-all ${showFilters ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        <MdFilterList size={24} />
                    </button>
                    <button
                        onClick={handleGetUserLocation}
                        className="bg-white p-3 rounded-full shadow-lg text-gray-700 hover:bg-gray-50 transition-all"
                        title="Usar mi ubicación"
                    >
                        <MdMyLocation size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}
