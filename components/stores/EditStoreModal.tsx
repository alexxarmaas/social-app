"use client";

import { useState } from "react";
import { updateStore } from "@/app/actions/store";
import { MdClose, MdStore, MdSave, MdAccessTime, MdImage, MdLocationOn } from "react-icons/md";
import Image from "next/image";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("@/components/map/LocationPicker"), {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-slate-800 animate-pulse rounded-lg"></div>
});

interface EditStoreModalProps {
    store: any;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditStoreModal({ store, isOpen, onClose }: EditStoreModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [infoData, setInfoData] = useState({
        name: store.name,
        description: store.description || "",
        location: store.location || "",
        openingHours: store.openingHours || ""
    });

    const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(
        store.latitude && store.longitude ? { lat: store.latitude, lng: store.longitude } : null
    );

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    // Preview URLs
    const [logoPreview, setLogoPreview] = useState(store.logo || "");
    const [bannerPreview, setBannerPreview] = useState(store.banner || "");

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (f: File | null) => void, setPreview: (s: string) => void) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        const formData = new FormData();
        formData.append("name", infoData.name);
        formData.append("description", infoData.description);
        formData.append("location", infoData.location);
        formData.append("openingHours", infoData.openingHours);

        if (coordinates) {
            formData.append("latitude", coordinates.lat.toString());
            formData.append("longitude", coordinates.lng.toString());
        }

        if (logoFile) formData.append("logo", logoFile);
        if (bannerFile) formData.append("banner", bannerFile);

        const result = await updateStore(store.id, formData);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccess("Información actualizada correctamente");
            setTimeout(() => {
                onClose();
                window.location.reload();
            }, 1000);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl w-full max-w-2xl border border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <MdStore className="text-red-500" />
                        Editar Tienda
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <MdClose size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm mb-4">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-500/10 border border-green-500 text-green-500 p-3 rounded-lg text-sm mb-4">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleUpdateInfo} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={infoData.name}
                                    onChange={(e) => setInfoData({ ...infoData, name: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Ubicación</label>
                                <input
                                    type="text"
                                    value={infoData.location}
                                    onChange={(e) => setInfoData({ ...infoData, location: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                <MdLocationOn className="text-red-500" /> Ubicación en Mapa
                            </label>
                            <LocationPicker
                                onLocationSelect={(lat, lng) => setCoordinates({ lat, lng })}
                                initialLat={coordinates?.lat}
                                initialLng={coordinates?.lng}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Horario de Apertura</label>
                            <div className="relative">
                                <MdAccessTime className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    value={infoData.openingHours}
                                    onChange={(e) => setInfoData({ ...infoData, openingHours: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                                    placeholder="Ej: Lunes a Viernes 9:00 - 20:00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Descripción</label>
                            <textarea
                                value={infoData.description}
                                onChange={(e) => setInfoData({ ...infoData, description: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-red-500 transition-colors min-h-[100px]"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Logo</label>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-16 h-16 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
                                        {logoPreview ? (
                                            <Image src={logoPreview} alt="Logo Preview" fill className="object-fill" unoptimized />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-500">
                                                <MdImage size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-700 transition-colors text-sm">
                                        Subir Logo
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setLogoFile, setLogoPreview)} />
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Banner</label>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-full h-16 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
                                        {bannerPreview ? (
                                            <Image src={bannerPreview} alt="Banner Preview" fill className="object-fill" unoptimized />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-500">
                                                <MdImage size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-700 transition-colors text-sm whitespace-nowrap">
                                        Subir Banner
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setBannerFile, setBannerPreview)} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <MdSave size={20} />
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
