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

        // Client-side resize/compress to avoid server size limits
        const compressImage = async (file: File, maxDim: number, quality: number) => {
            try {
                // createImageBitmap is fast and works in modern browsers
                const bitmap = await createImageBitmap(file);
                const { width, height } = bitmap;

                let targetWidth = width;
                let targetHeight = height;

                if (width > maxDim || height > maxDim) {
                    if (width >= height) {
                        targetWidth = maxDim;
                        targetHeight = Math.round((height / width) * maxDim);
                    } else {
                        targetHeight = maxDim;
                        targetWidth = Math.round((width / height) * maxDim);
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Canvas not supported');
                ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

                // Prefer jpeg for better compression unless original is png with transparency
                const useType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

                const blob = await new Promise<Blob | null>((resolve) =>
                    canvas.toBlob((b) => resolve(b), useType, quality)
                );

                if (!blob) throw new Error('Compression failed');
                return blob;
            } catch (err) {
                console.warn('Compression failed, uploading original file', err);
                return null;
            }
        };

        // Choose sensible defaults per type
        let maxDim = 2048;
        let quality = 0.8;
        if (type === 'avatar') {
            maxDim = 800;
            quality = 0.8;
        } else if (type === 'cover') {
            maxDim = 3000;
            quality = 0.9;
        } else if (type === 'post' || type === 'event' || type === 'club') {
            maxDim = 2048;
            quality = 0.8;
        }

        let uploadFile: File = file;
        try {
            const compressed = await compressImage(file, maxDim, quality);
            if (compressed) {
                // Create a File so server receives a file-like object
                uploadFile = new File([compressed], file.name.replace(/\s+/g, '-'), { type: compressed.type });
                console.log('Original size:', (file.size / 1024 / 1024).toFixed(2) + 'MB', 'Compressed size:', (uploadFile.size / 1024 / 1024).toFixed(2) + 'MB');
            }
        } catch (err) {
            console.warn('Compression error, continuing with original file', err);
        }

        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('type', type);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Error al subir la imagen');
            }

            const data = await response.json();
            onUploadComplete(data.url);
            setSuccess(true);
        } catch (err) {
            setError('Error al subir');
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
                    accept="image/*, .heic, .heif, .webp"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="hidden"
                />
            </label>
        </div>
    );
}
