"use client";

import { useState, useEffect } from "react";
import { addCar } from "@/app/actions/profile";
import Image from "next/image";
import { createPortal } from "react-dom";

interface AddCarModalProps {
    onClose: () => void;
}

export default function AddCarModal({ onClose }: AddCarModalProps) {
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        if (image) {
            formData.set("image", image);
        }

        await addCar(formData);
        setLoading(false);
        onClose();
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700 max-h-[90vh] overflow-y-auto relative">
                <h2 className="text-xl font-bold text-white mb-4">Añadir Vehículo</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Marca</label>
                            <input name="make" required className="w-full bg-slate-700/50 text-white rounded-lg px-4 py-2 border border-slate-600" placeholder="Toyota" />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Modelo</label>
                            <input name="model" required className="w-full bg-slate-700/50 text-white rounded-lg px-4 py-2 border border-slate-600" placeholder="Supra" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Año</label>
                        <input name="year" type="number" required className="w-full bg-slate-700/50 text-white rounded-lg px-4 py-2 border border-slate-600" placeholder="1998" />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Modificaciones (Opcional)</label>
                        <textarea name="modifications" className="w-full bg-slate-700/50 text-white rounded-lg px-4 py-2 border border-slate-600 min-h-[80px]" placeholder="Turbo, Escape, Llantas..." />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Foto</label>
                        <div className="relative h-40 bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer hover:border-red-500 transition-colors overflow-hidden">
                            {preview ? (
                                <Image src={preview} alt="Preview" fill className="object-contain" />
                            ) : (
                                <span className="text-slate-400">Click para subir foto</span>
                            )}
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setImage(file);
                                        setPreview(URL.createObjectURL(file));
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 disabled:opacity-50"
                        >
                            {loading ? "Añadiendo..." : "Añadir"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
