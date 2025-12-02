"use client";

import { useState, useEffect } from "react";
import { updateCar } from "@/app/actions/profile";
import Image from "next/image";
import { createPortal } from "react-dom";
import { MdClose, MdCloudUpload, MdSave, MdDirectionsCar } from "react-icons/md";

interface EditCarModalProps {
    car: any;
    onClose: () => void;
}

export default function EditCarModal({ car, onClose }: EditCarModalProps) {
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(car.imageUrl);
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
        formData.append("id", car.id);
        if (image) {
            formData.set("image", image);
        }

        await updateCar(formData);
        setLoading(false);
        onClose();
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700 max-h-[90vh] overflow-y-auto relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <MdClose size={24} />
                </button>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <MdDirectionsCar /> Editar Vehículo
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Marca</label>
                            <input name="make" defaultValue={car.make} required className="w-full bg-slate-700/50 text-white rounded-lg px-4 py-2 border border-slate-600" />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Modelo</label>
                            <input name="model" defaultValue={car.model} required className="w-full bg-slate-700/50 text-white rounded-lg px-4 py-2 border border-slate-600" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Año</label>
                        <input name="year" type="number" defaultValue={car.year} required className="w-full bg-slate-700/50 text-white rounded-lg px-4 py-2 border border-slate-600" />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Modificaciones</label>
                        <textarea name="modifications" defaultValue={car.modifications || ""} className="w-full bg-slate-700/50 text-white rounded-lg px-4 py-2 border border-slate-600 min-h-[80px]" />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Foto</label>
                        <div className="relative h-40 bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer hover:border-red-500 transition-colors overflow-hidden">
                            {preview ? (
                                <Image src={preview} alt="Preview" fill className="object-fill" />
                            ) : (
                                <div className="flex flex-col items-center text-slate-400">
                                    <MdCloudUpload size={32} />
                                    <span className="text-sm mt-2">Cambiar foto</span>
                                </div>
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
                            className="flex-1 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? "Guardando..." : <><MdSave /> Guardar Cambios</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
