"use client";

import { useState } from "react";
import { createListing } from "@/app/actions/marketplace";
import { MdClose, MdAttachMoney, MdCategory, MdDescription, MdImage, MdLabel } from "react-icons/md";

interface CreateListingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateListingModal({ isOpen, onClose }: CreateListingModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const result = await createListing(formData);

        if (result.error) {
            setError(result.error);
        } else {
            onClose();
            // Ideally we'd trigger a reload here, but revalidatePath in action handles the data refresh
            // We might need to manually refresh if using client-side state for listings
            window.location.reload();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Vender Artículo</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <MdClose size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1">Título</label>
                        <input
                            type="text"
                            name="title"
                            required
                            placeholder="Ej: Llantas BBS 18''"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Price */}
                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-1">Precio (€)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 pl-10 text-white focus:outline-none focus:border-red-500 transition-colors"
                                />
                                <MdAttachMoney className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-1">Categoría</label>
                            <div className="relative">
                                <select
                                    name="category"
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 pl-10 text-white focus:outline-none focus:border-red-500 transition-colors appearance-none"
                                >
                                    <option value="Coches">Coches</option>
                                    <option value="Piezas">Piezas</option>
                                    <option value="Llantas">Llantas</option>
                                    <option value="Accesorios">Accesorios</option>
                                    <option value="Otros">Otros</option>
                                </select>
                                <MdCategory className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            </div>
                        </div>
                    </div>

                    {/* Condition */}
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1">Estado</label>
                        <div className="relative">
                            <select
                                name="condition"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 pl-10 text-white focus:outline-none focus:border-red-500 transition-colors appearance-none"
                            >
                                <option value="Nuevo">Nuevo</option>
                                <option value="Usado - Como nuevo">Usado - Como nuevo</option>
                                <option value="Usado - Buen estado">Usado - Buen estado</option>
                                <option value="Usado - Aceptable">Usado - Aceptable</option>
                                <option value="Para piezas">Para piezas</option>
                            </select>
                            <MdLabel className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1">Descripción</label>
                        <div className="relative">
                            <textarea
                                name="description"
                                required
                                rows={3}
                                placeholder="Describe tu artículo..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 pl-10 text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                            />
                            <MdDescription className="absolute left-3 top-3 text-slate-500" />
                        </div>
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1">Imagen</label>
                        <div className="relative">
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 pl-10 text-slate-300 focus:outline-none focus:border-red-500 transition-colors file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600"
                            />
                            <MdImage className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            "Publicar Anuncio"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
