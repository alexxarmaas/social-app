"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { MdEdit, MdCameraAlt, MdCheck, MdClose, MdLocationOn, MdGroups, MdEvent } from "react-icons/md";
import { updateClub } from "@/app/actions/club";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ui/ImageUpload";

interface ClubHeaderProps {
    club: any;
    isOwner: boolean;
    isAdmin: boolean;
    isMember: boolean;
}

export default function ClubHeader({ club, isOwner, isAdmin, isMember }: ClubHeaderProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form states
    const [name, setName] = useState(club.name);
    const [description, setDescription] = useState(club.description || "");
    const [category, setCategory] = useState(club.category);
    const [location, setLocation] = useState(club.location || "");
    const [website, setWebsite] = useState(club.website || "");
    const [instagram, setInstagram] = useState(club.instagram || "");
    const [twitter, setTwitter] = useState(club.twitter || "");
    const [tiktok, setTiktok] = useState(club.tiktok || "");

    // Image states
    const [logoUrl, setLogoUrl] = useState(club.imageUrl);
    const [coverUrl, setCoverUrl] = useState(club.coverImage);

    const handleSave = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("category", category);
            formData.append("location", location);
            formData.append("website", website);
            formData.append("instagram", instagram);
            formData.append("twitter", twitter);
            formData.append("tiktok", tiktok);

            if (logoUrl) formData.append("logoUrl", logoUrl);
            if (coverUrl) formData.append("coverUrl", coverUrl);

            const result = await updateClub(club.id, formData);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Club actualizado correctamente");
                setIsEditing(false);
                router.refresh();
            }
        } catch (error) {
            toast.error("Error al actualizar el club");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setName(club.name);
        setDescription(club.description || "");
        setCategory(club.category);
        setLocation(club.location || "");
        setWebsite(club.website || "");
        setInstagram(club.instagram || "");
        setTwitter(club.twitter || "");
        setTiktok(club.tiktok || "");
        setLogoUrl(club.imageUrl);
        setCoverUrl(club.coverImage);
    };

    return (
        <div className="relative">
            {/* Cover Image */}
            <div className="h-64 md:h-80 w-full relative group">
                <Image
                    src={coverUrl || "/placeholder-cover.svg"}
                    alt="Cover"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ImageUpload
                            onUploadComplete={(url) => {
                                setCoverUrl(url);
                                toast.success("Portada actualizada");
                            }}
                            type="club"
                            label="Cambiar Portada"
                            className="bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-colors"
                        />
                    </div>
                )}
            </div>

            {/* Club Info Container */}
            <div className="container mx-auto px-4 relative -mt-20 z-10">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Logo */}
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-black bg-zinc-900 overflow-hidden relative shadow-xl">
                            <Image
                                src={logoUrl || "/placeholder-logo.svg"}
                                alt="Logo"
                                fill
                                className="object-cover"
                            />
                            {isEditing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ImageUpload
                                        onUploadComplete={(url) => {
                                            setLogoUrl(url);
                                            toast.success("Logo actualizado");
                                        }}
                                        type="club"
                                        label=""
                                        className="bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-colors p-2"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 pt-2 md:pt-20 text-white">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="text-3xl md:text-4xl font-bold bg-transparent border-b border-white/20 focus:border-red-500 outline-none w-full mb-2"
                                        placeholder="Nombre del Club"
                                    />
                                ) : (
                                    <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                                        {name}
                                        {club.verified && <MdCheck className="text-blue-500 bg-white rounded-full p-0.5" size={24} />}
                                    </h1>
                                )}

                                <div className="flex flex-wrap items-center gap-4 text-zinc-400 text-sm md:text-base">
                                    <span className="flex items-center gap-1">
                                        <MdGroups className="text-red-500" />
                                        {club._count?.members || 0} Miembros
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MdEvent className="text-red-500" />
                                        {club._count?.events || 0} Eventos
                                    </span>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="bg-transparent border-b border-white/20 focus:border-red-500 outline-none w-40"
                                            placeholder="Ubicación"
                                        />
                                    ) : (
                                        location && (
                                            <span className="flex items-center gap-1">
                                                <MdLocationOn className="text-red-500" />
                                                {location}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                {(session && (isOwner || isAdmin)) && !isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <MdEdit /> Editar Club
                                    </button>
                                )}

                                {isEditing && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleCancel}
                                            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                        >
                                            <MdClose /> Cancelar
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {loading ? "Guardando..." : <><MdCheck /> Guardar</>}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description & Socials */}
                        <div className="mt-6 space-y-4">
                            {isEditing ? (
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-zinc-300 focus:border-red-500 outline-none resize-none h-24"
                                    placeholder="Descripción del club..."
                                />
                            ) : (
                                <p className="text-zinc-300 max-w-3xl leading-relaxed">
                                    {description}
                                </p>
                            )}

                            {isEditing && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 p-4 rounded-lg border border-white/10">
                                    <input
                                        type="text"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        className="bg-transparent border-b border-white/20 focus:border-red-500 outline-none p-2 text-sm"
                                        placeholder="Website URL"
                                    />
                                    <input
                                        type="text"
                                        value={instagram}
                                        onChange={(e) => setInstagram(e.target.value)}
                                        className="bg-transparent border-b border-white/20 focus:border-red-500 outline-none p-2 text-sm"
                                        placeholder="Instagram URL"
                                    />
                                    <input
                                        type="text"
                                        value={twitter}
                                        onChange={(e) => setTwitter(e.target.value)}
                                        className="bg-transparent border-b border-white/20 focus:border-red-500 outline-none p-2 text-sm"
                                        placeholder="Twitter URL"
                                    />
                                    <input
                                        type="text"
                                        value={tiktok}
                                        onChange={(e) => setTiktok(e.target.value)}
                                        className="bg-transparent border-b border-white/20 focus:border-red-500 outline-none p-2 text-sm"
                                        placeholder="TikTok URL"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
