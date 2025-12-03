"use client";

import { useState } from "react";
import { createClub } from "@/app/actions/club";
import { MdClose, MdGroups, MdImage, MdDescription, MdCategory } from "react-icons/md";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ui/ImageUpload";

interface CreateClubModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateClubModal({ isOpen, onClose }: CreateClubModalProps) {
    const [loading, setLoading] = useState(false);
    const [logoUrl, setLogoUrl] = useState("");
    const [coverUrl, setCoverUrl] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.append("logoUrl", logoUrl);
        formData.append("coverUrl", coverUrl);
        const result = await createClub(formData);

        if (result.error) {
            toast.error(result.error);
        } else if (result.club) {
            toast.success("¡Club creado con éxito!");
            onClose();
            router.push(`/clubs/${result.club.id}`);
        }

        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-800 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <MdGroups className="text-red-500" />
                        Crear Club
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1">Nombre del Club</label>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="Ej: Midnight Runners"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
                        />
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
                                <option value="JDM">JDM</option>
                                <option value="VAG">VAG</option>
                                <option value="American">Americanos</option>
                                <option value="Classic">Clásicos</option>
                                <option value="Tuner">Tuner / Multimarca</option>
                                <option value="Offroad">4x4 / Offroad</option>
                                <option value="PSA">PSA</option>
                                <option value="BMW">BMW / Mercedes</option>
                                <option value="Opel">Opel</option>
                                <option value="Motorcycles">Motocicletas</option>
                            </select>
                            <MdCategory className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1">Descripción</label>
                        <div className="relative">
                            <textarea
                                name="description"
                                rows={3}
                                placeholder="¿De qué trata tu club?"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 pl-10 text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                            />
                            <MdDescription className="absolute left-3 top-3 text-slate-500" />
                        </div>
                    </div>

                    {/* Logo */}
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1">Logo del Club</label>
                        <div className="relative">
                            <ImageUpload
                                onUploadComplete={(url) => setLogoUrl(url)}
                                type="club"
                                label="Subir Logo"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg text-slate-300"
                            />
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1">Imagen de Portada</label>
                        <div className="relative">
                            <ImageUpload
                                onUploadComplete={(url) => setCoverUrl(url)}
                                type="club"
                                label="Subir Portada"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg text-slate-300"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50"
                        >
                            {loading ? "Creando Club..." : "Crear Club"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
