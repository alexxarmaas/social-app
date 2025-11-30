"use client";

import { useState } from "react";
import { createStore } from "@/app/actions/store";
import { MdClose, MdStore, MdLocationOn, MdDescription, MdImage } from "react-icons/md";
import dynamic from "next/dynamic";
import Image from "next/image";

const LocationPicker = dynamic(() => import("@/components/map/LocationPicker"), {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-slate-800 animate-pulse rounded-lg"></div>
});

interface CreateStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateStoreModal({ isOpen, onClose }: CreateStoreModalProps) {
    const [loading, setLoading] = useState(false);
    const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);

        if (coordinates) {
            formData.append("latitude", coordinates.lat.toString());
            formData.append("longitude", coordinates.lng.toString());
        }

        const result = await createStore(formData);

        if (result.error) {
            alert(result.error);
        } else {
            onClose();
            // Reset state
            setCoordinates(null);
            setLogoPreview(null);
            setBannerPreview(null);
            window.location.reload();
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-800 shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <MdStore className="text-red-500" />
                        Abrir Tienda
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <MdClose size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Nombre de la Tienda *</label>
                        <div className="relative">
                            <MdStore className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="Ej: JDM Parts Madrid"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Descripción *</label>
                        <div className="relative">
                            <MdDescription className="absolute left-3 top-3 text-slate-500" />
                            <textarea
                                name="description"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors min-h-[100px]"
                                placeholder="¿Qué vendes en tu tienda?"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Ubicación *</label>
                        <div className="relative mb-2">
                            <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                name="location"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="Ej: Madrid, España"
                            />
                        </div>
                        <div className="mb-4">
                            <p className="text-xs text-slate-400 mb-2">Selecciona la ubicación exacta en el mapa:</p>
                            <LocationPicker onLocationSelect={(lat, lng) => setCoordinates({ lat, lng })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Logo</label>
                            <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center hover:border-red-500 transition-colors relative overflow-hidden group h-32 flex items-center justify-center">
                                <input
                                    type="file"
                                    name="logo"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {logoPreview ? (
                                    <Image src={logoPreview} alt="Logo Preview" fill className="object-contain p-2" />
                                ) : (
                                    <div className="flex flex-col items-center text-slate-500">
                                        <MdImage size={24} className="mb-1" />
                                        <span className="text-xs">Subir Logo</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Banner</label>
                            <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center hover:border-red-500 transition-colors relative overflow-hidden group h-32 flex items-center justify-center">
                                <input
                                    type="file"
                                    name="banner"
                                    accept="image/*"
                                    onChange={handleBannerChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {bannerPreview ? (
                                    <Image src={bannerPreview} alt="Banner Preview" fill className="object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center text-slate-500">
                                        <MdImage size={24} className="mb-1" />
                                        <span className="text-xs">Subir Banner</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50"
                    >
                        {loading ? "Creando..." : "Crear Tienda"}
                    </button>
                </form>
            </div>
        </div>
    );
}
