"use client";

import { useState, useEffect } from "react";
import { updateProfile } from "@/app/actions/profile";
import Image from "next/image";
import { createPortal } from "react-dom";
import { MdClose, MdCameraAlt, MdImage, MdSave } from "react-icons/md";

interface EditProfileModalProps {
    user: any;
    onClose: () => void;
}

export default function EditProfileModal({ user, onClose }: EditProfileModalProps) {
    const [name, setName] = useState(user.name || "");
    const [bio, setBio] = useState(user.bio || "");
    const [location, setLocation] = useState(user.location || "");
    const [avatar, setAvatar] = useState<File | null>(null);
    const [banner, setBanner] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar);
    const [bannerPreview, setBannerPreview] = useState<string | null>(user.banner);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("bio", bio);
            formData.append("location", location);
            if (avatar) formData.append("avatar", avatar);
            if (banner) formData.append("banner", banner);

            console.log("Submitting profile update...");
            const result = await updateProfile(formData);
            console.log("Update result:", result);

            setLoading(false);

            if (result.success) {
                console.log("Profile updated successfully, reloading...");
                window.location.reload();
            } else if (result.error) {
                console.error("Profile update error:", result.error);
                alert("Error: " + result.error);
            } else {
                console.error("Unknown error occurred");
                alert("Error desconocido al actualizar el perfil");
            }
        } catch (error) {
            console.error("Exception during profile update:", error);
            setLoading(false);
            alert("Error: " + (error instanceof Error ? error.message : "Error desconocido"));
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="bg-slate-800 rounded-xl max-w-md w-full border border-slate-700 relative overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Editar Perfil</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <MdClose size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Banner Upload */}
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Banner de Portada</label>
                            <div className="relative h-32 rounded-lg bg-slate-700 overflow-hidden group cursor-pointer border-2 border-dashed border-slate-600 hover:border-red-500 transition-colors">
                                {bannerPreview ? (
                                    <Image src={bannerPreview} alt="Banner" fill className="object-contain" unoptimized />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                        <MdImage size={32} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MdCameraAlt className="text-white text-2xl" />
                                </div>
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setBanner(file);
                                            setBannerPreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Avatar Upload */}
                        <div className="flex justify-center -mt-12 relative z-10">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-700 group cursor-pointer">
                                {avatarPreview ? (
                                    <Image src={avatarPreview} alt="Avatar" fill className="object-contain" unoptimized />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                                )}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MdCameraAlt className="text-white" />
                                </div>
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setAvatar(file);
                                            setAvatarPreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Nombre</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-700/50 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full bg-slate-700/50 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-red-500 min-h-[100px]"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Ubicación</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-slate-700/50 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-red-500"
                                placeholder="Ciudad, País"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
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
                                {loading ? "Guardando..." : <><MdSave /> Guardar</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
}
