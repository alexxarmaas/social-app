"use client";

import { useState, useEffect } from "react";
import { createEvent } from "@/app/actions/event";
import { MdClose, MdEvent, MdLocationOn, MdDescription, MdImage, MdCategory, MdPeople, MdGroups, MdLock, MdAccessTime } from "react-icons/md";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamically import LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import("@/components/map/LocationPicker"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-slate-800 animate-pulse rounded-lg"></div>
});

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    userAdminClubs?: any[];
}

export default function CreateEventModal({ isOpen, onClose, userAdminClubs = [] }: CreateEventModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedClubId, setSelectedClubId] = useState<string>("");
    const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);

        if (coordinates) {
            formData.append("latitude", coordinates.lat.toString());
            formData.append("longitude", coordinates.lng.toString());
        }

        const result = await createEvent(formData);

        if (result.error) {
            alert(result.error);
        } else {
            onClose();
            setPreviewUrl(null);
            setCoordinates(null);
        }
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-800 shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
                    <h2 className="text-2xl font-bold text-white font-aeroblade tracking-wide">Crear Evento</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <MdClose size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Club Selection */}
                    {userAdminClubs.length > 0 && (
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                <MdGroups className="text-blue-400" /> Organizar como Club (Opcional)
                            </label>
                            <select
                                name="clubId"
                                value={selectedClubId}
                                onChange={(e) => setSelectedClubId(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Perfil Personal</option>
                                {userAdminClubs.map(club => (
                                    <option key={club.id} value={club.id}>{club.name}</option>
                                ))}
                            </select>

                            {selectedClubId && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                        <MdLock className="text-yellow-400" /> Visibilidad
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="visibility" value="public" defaultChecked className="accent-blue-500" />
                                            <span className="text-slate-300">Público</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="visibility" value="members_only" className="accent-blue-500" />
                                            <span className="text-slate-300">Solo Miembros</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Título del Evento</label>
                        <input
                            type="text"
                            name="title"
                            required
                            placeholder="Ej: KDD Nocturna Madrid"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-red-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Fecha y Hora</label>
                            <div className="relative">
                                <MdAccessTime className="absolute left-3 top-3 text-slate-500" size={20} />
                                <input
                                    type="datetime-local"
                                    name="startDate"
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 [color-scheme:dark]"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Tipo de Evento</label>
                            <select
                                name="eventType"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-red-500"
                            >
                                <option value="meet">KDD / Meet</option>
                                <option value="show">Exhibición</option>
                                <option value="race">Carrera / Track Day</option>
                                <option value="cruise">Ruta</option>
                                <option value="workshop">Taller / Workshop</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                                <MdPeople /> Límite de Asistentes (Opcional)
                            </label>
                            <input
                                type="number"
                                name="maxAttendees"
                                placeholder="Sin límite"
                                min="1"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-red-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                                💶 Precio (Opcional)
                            </label>
                            <input
                                type="number"
                                name="price"
                                placeholder="0 (Gratis)"
                                min="0"
                                step="0.01"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-red-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Ubicación</label>
                        <div className="relative mb-2">
                            <MdLocationOn className="absolute left-3 top-3 text-slate-500" size={20} />
                            <input
                                type="text"
                                name="location"
                                required
                                placeholder="Nombre del lugar o dirección"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-red-500"
                            />
                        </div>
                        <div className="mb-4">
                            <p className="text-xs text-slate-400 mb-2">Selecciona la ubicación exacta en el mapa:</p>
                            <LocationPicker onLocationSelect={(lat, lng) => setCoordinates({ lat, lng })} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Descripción</label>
                        <textarea
                            name="description"
                            rows={4}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-red-500"
                            placeholder="Detalles del evento, normas, etc."
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Imagen de Portada</label>
                        <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-red-500 transition-colors relative overflow-hidden group">
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            {previewUrl ? (
                                <Image src={previewUrl} alt="Preview" fill className="object-contain" />
                            ) : (
                                <div className="flex flex-col items-center text-slate-500">
                                    <MdImage size={48} className="mb-2" />
                                    <span>Haz clic o arrastra una imagen</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-2 rounded-lg font-bold hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50"
                        >
                            {isLoading ? "Creando..." : "Crear Evento"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
