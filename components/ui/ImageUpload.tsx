"use client";

import { useState } from "react";
import { MdCloudUpload, MdCheck, MdError } from "react-icons/md";
import Image from "next/image";

interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    label?: string;
    className?: string;
    type?: "avatar" | "cover" | "post" | "event" | "club" | "misc";
}

export default function ImageUpload({ onUploadComplete, label = "Subir Imagen", className = "", type = "misc" }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Error al subir la imagen");
            }

            const data = await response.json();
            onUploadComplete(data.url);
            setSuccess(true);
        } catch (err) {
            setError("Error al subir");
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <label className={`
                flex items-center justify-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all
                ${uploading ? "bg-slate-700 text-slate-400 cursor-not-allowed" : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600"}
                ${success ? "border-green-500 text-green-400" : ""}
                ${error ? "border-red-500 text-red-400" : ""}
            `}>
                {uploading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : success ? (
                    <MdCheck size={20} />
                ) : error ? (
                    <MdError size={20} />
                ) : (
                    <MdCloudUpload size={20} />
                )}

                <span className="font-medium text-sm">
                    {uploading ? "Subiendo..." : success ? "¡Subido!" : error ? "Error" : label}
                </span>

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="hidden"
                />
            </label>
        </div>
    );
}
