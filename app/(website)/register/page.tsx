"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdEmail, MdPerson, MdLock, MdStore, MdGroups, MdArrowForward, MdAddPhotoAlternate } from "react-icons/md";
import { toast } from "react-hot-toast";
import Image from "next/image";
import ImageUpload from "@/components/ui/ImageUpload";

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        role: "user", // user, club_admin, store_manager
        name: "",
        // Club specific
        clubName: "",
        clubCategory: "",
        // Store specific
        storeName: "",
        storeDescription: "",
        // Images
        avatarUrl: "",
        bannerUrl: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });

            const res = await fetch("/api/auth/register", {
                method: "POST",
                body: data,
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Error al registrarse");
            }

            toast.success("¡Registro exitoso! Redirigiendo...");
            router.push("/login");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al registrarse");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-10 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-zinc-900/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">
                        Crear Cuenta
                    </h1>
                    <p className="text-zinc-400">Únete a la comunidad de Tramassso</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
                            {/* Basic Info */}
                            <div className="relative">
                                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Correo electrónico"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                            <div className="relative">
                                <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Nombre de usuario"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                            <div className="relative">
                                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Contraseña"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                            <div className="relative">
                                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirmar contraseña"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                            >
                                Siguiente <MdArrowForward />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400 ml-1">Tipo de cuenta</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: "user" })}
                                        className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${formData.role === "user"
                                            ? "bg-red-500/10 border-red-500 text-red-500"
                                            : "bg-black/20 border-white/10 text-zinc-400 hover:bg-white/5"
                                            }`}
                                    >
                                        <MdPerson size={24} />
                                        <span className="text-xs font-medium">Usuario</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: "club_admin" })}
                                        className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${formData.role === "club_admin"
                                            ? "bg-red-500/10 border-red-500 text-red-500"
                                            : "bg-black/20 border-white/10 text-zinc-400 hover:bg-white/5"
                                            }`}
                                    >
                                        <MdGroups size={24} />
                                        <span className="text-xs font-medium">Club</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: "store_manager" })}
                                        className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${formData.role === "store_manager"
                                            ? "bg-red-500/10 border-red-500 text-red-500"
                                            : "bg-black/20 border-white/10 text-zinc-400 hover:bg-white/5"
                                            }`}
                                    >
                                        <MdStore size={24} />
                                        <span className="text-xs font-medium">Tienda</span>
                                    </button>
                                </div>
                            </div>

                            {/* Images Upload */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-zinc-400 ml-1 mb-2 block">Foto de Perfil</label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-zinc-800 border border-white/10">
                                            {formData.avatarUrl ? (
                                                <Image src={formData.avatarUrl} alt="Avatar" fill className="object-contain" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                                    <MdPerson size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <ImageUpload
                                            onUploadComplete={(url) => {
                                                setFormData({ ...formData, avatarUrl: url });
                                                toast.success("Avatar subido");
                                            }}
                                            type="avatar"
                                            label="Subir Avatar"
                                            className="bg-zinc-800 text-white text-sm rounded-lg hover:bg-zinc-700 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-zinc-400 ml-1 mb-2 block">Banner</label>
                                    <div className="space-y-2">
                                        <div className="relative w-full h-24 rounded-lg overflow-hidden bg-zinc-800 border border-white/10">
                                            {formData.bannerUrl ? (
                                                <Image src={formData.bannerUrl} alt="Banner" fill className="object-contain" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                                    <MdAddPhotoAlternate size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <ImageUpload
                                            onUploadComplete={(url) => {
                                                setFormData({ ...formData, bannerUrl: url });
                                                toast.success("Banner subido");
                                            }}
                                            type="misc"
                                            label="Subir Banner"
                                            className="w-full bg-zinc-800 text-white text-sm rounded-lg hover:bg-zinc-700 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {formData.role === "club_admin" && (
                                <>
                                    <input
                                        type="text"
                                        name="clubName"
                                        placeholder="Nombre del Club"
                                        required
                                        value={formData.clubName}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-4 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                                    />
                                    <select
                                        name="clubCategory"
                                        required
                                        value={formData.clubCategory}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-4 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                                    >
                                        <option value="">Categoría del Club</option>
                                        <option value="JDM">JDM</option>
                                        <option value="European">European</option>
                                        <option value="American Muscle">American Muscle</option>
                                        <option value="Classic">Classic</option>
                                        <option value="Tuner">Tuner</option>
                                        <option value="Off-road">Off-road</option>
                                    </select>
                                </>
                            )}

                            {formData.role === "store_manager" && (
                                <>
                                    <input
                                        type="text"
                                        name="storeName"
                                        placeholder="Nombre de la Tienda"
                                        required
                                        value={formData.storeName}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-4 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                                    />
                                    <textarea
                                        name="storeDescription"
                                        placeholder="Descripción de la tienda"
                                        value={formData.storeDescription}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-4 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors resize-none h-24"
                                    />
                                </>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-zinc-800 text-white font-bold py-3 rounded-lg hover:bg-zinc-700 transition-colors"
                                >
                                    Atrás
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Creando..." : "Crear Cuenta"}
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                <div className="mt-6 text-center">
                    <p className="text-zinc-400 text-sm">
                        ¿Ya tienes cuenta?{" "}
                        <Link href="/login" className="text-white hover:underline">
                            Inicia Sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
