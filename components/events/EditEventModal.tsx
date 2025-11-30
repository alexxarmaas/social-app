"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MdClose, MdSave, MdImage, MdLocationOn, MdAccessTime, MdAttachMoney, MdPeople } from "react-icons/md";
import { updateEvent } from "@/app/actions/event";
import { toast } from "react-hot-toast";
import Image from "next/image";
import ImageUpload from "@/components/ui/ImageUpload";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("../map/LocationPicker"), {
    ssr: false,
    loading: () => <div className="h-[300px] bg-slate-800 animate-pulse rounded-xl" />
});

interface EditEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: any;
}

export default function EditEventModal({ isOpen, onClose, event }: EditEventModalProps) {
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        date: "",
        time: "",
        eventType: "car_meet",
        maxAttendees: "",
        price: 0,
        imageUrl: ""
    });

    const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (event) {
            const date = new Date(event.startDate);
            setFormData({
                title: event.title,
                description: event.description || "",
                location: event.location,
                date: date.toISOString().split('T')[0],
                time: date.toTimeString().slice(0, 5),
                eventType: event.eventType,
                maxAttendees: event.maxAttendees?.toString() || "",
                price: event.price || 0,
                imageUrl: event.imageUrl || ""
            });
            if (event.latitude && event.longitude) {
                setCoordinates({ lat: event.latitude, lng: event.longitude });
            }
        }
    }, [event]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("location", formData.location);
        data.append("date", formData.date);
        data.append("time", formData.time);
        data.append("eventType", formData.eventType);
        if (formData.maxAttendees) data.append("maxAttendees", formData.maxAttendees);
        data.append("price", formData.price.toString());
        if (formData.imageUrl) data.append("imageUrl", formData.imageUrl);

        if (coordinates) {
            data.append("latitude", coordinates.lat.toString());
            data.append("longitude", coordinates.lng.toString());
        }

        const result = await updateEvent(event.id, data);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Evento actualizado");
            onClose();
            window.location.reload();
        }
        setLoading(false);
    };

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white">Editar Evento</h2>
                        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <MdClose size={24} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Imagen del Evento</label>
                            <div className="relative aspect-video bg-slate-800 rounded-xl overflow-hidden border-2 border-dashed border-slate-700 group hover:border-red-500 transition-colors">
                                {formData.imageUrl ? (
                                    <>
                                        <Image src={formData.imageUrl} alt="Preview" fill className="object-contain" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, imageUrl: "" })}
                                            className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <MdClose size={20} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <ImageUpload
                                            onUploadComplete={(url) => {
                                                setFormData({ ...formData, imageUrl: url });
                                                toast.success("Imagen cargada");
                                            }}
                                            type="event"
                                            label="Subir Imagen"
                                        />
                                        <p className="text-slate-500 text-sm mt-2">Recomendado: 1920x1080</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-400 mb-1">Título del Evento</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Fecha</label>
                                <div className="relative">
                                    <MdAccessTime className="absolute left-3 top-3 text-slate-500" size={20} />
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Hora</label>
                                <div className="relative">
                                    <MdAccessTime className="absolute left-3 top-3 text-slate-500" size={20} />
                                    <input
                                        type="time"
                                        required
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-red-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Ubicación</label>
                            <div className="relative mb-2">
                                <MdLocationOn className="absolute left-3 top-3 text-slate-500" size={20} />
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-red-500"
                                    placeholder="Dirección o nombre del lugar"
                                />
                            </div>
                            <div className="h-[200px] rounded-xl overflow-hidden border border-slate-700">
                                <LocationPicker
                                    onLocationSelect={(lat, lng) => setCoordinates({ lat, lng })}
                                    initialLat={coordinates?.lat}
                                    initialLng={coordinates?.lng}
                                />
                            </div>
                        </div>

                        {/* Price & Capacity */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Precio (€)</label>
                                <div className="relative">
                                    <MdAttachMoney className="absolute left-3 top-3 text-slate-500" size={20} />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-red-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Capacidad Máxima</label>
                                <div className="relative">
                                    <MdPeople className="absolute left-3 top-3 text-slate-500" size={20} />
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Sin límite"
                                        value={formData.maxAttendees}
                                        onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-red-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Descripción</label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-red-500 resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-red-600/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <MdSave size={20} />
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
