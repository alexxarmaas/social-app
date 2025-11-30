"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/user";
import { MdSave, MdPerson, MdLocationOn, MdImage, MdDescription } from "react-icons/md";

interface ProfileSettingsProps {
    user: any;
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const result = await updateProfile(formData);

        if (result.error) {
            setMessage({ type: "error", text: result.error });
        } else {
            setMessage({ type: "success", text: "Perfil actualizado correctamente" });
        }
        setLoading(false);
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Editar Perfil</h2>

            {message && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === "success" ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-red-500/20 text-red-400 border border-red-500/50"}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Nombre</label>
                    <div className="relative">
                        <input
                            type="text"
                            name="name"
                            defaultValue={user.name || ""}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 pl-10 text-white focus:outline-none focus:border-red-500 transition-colors"
                            placeholder="Tu nombre"
                        />
                        <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    </div>
                </div>

                {/* Bio */}
                <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Biografía</label>
                    <div className="relative">
                        <textarea
                            name="bio"
                            defaultValue={user.bio || ""}
                            rows={3}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 pl-10 text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                            placeholder="Cuéntanos sobre ti..."
                        />
                        <MdDescription className="absolute left-3 top-4 text-slate-500" />
                    </div>
                </div>

                {/* Location */}
                <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Ubicación</label>
                    <div className="relative">
                        <input
                            type="text"
                            name="location"
                            defaultValue={user.location || ""}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 pl-10 text-white focus:outline-none focus:border-red-500 transition-colors"
                            placeholder="Ciudad, País"
                        />
                        <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    </div>
                </div>

                {/* Avatar URL */}
                <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">URL del Avatar</label>
                    <div className="relative">
                        <input
                            type="text"
                            name="avatar"
                            defaultValue={user.avatar || ""}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 pl-10 text-white focus:outline-none focus:border-red-500 transition-colors"
                            placeholder="https://ejemplo.com/avatar.jpg"
                        />
                        <MdImage className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Pega una URL de imagen para tu foto de perfil</p>
                </div>

                {/* Banner URL */}
                <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">URL del Banner</label>
                    <div className="relative">
                        <input
                            type="text"
                            name="banner"
                            defaultValue={user.banner || ""}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 pl-10 text-white focus:outline-none focus:border-red-500 transition-colors"
                            placeholder="https://ejemplo.com/banner.jpg"
                        />
                        <MdImage className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Pega una URL de imagen para tu portada</p>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
    );
}
