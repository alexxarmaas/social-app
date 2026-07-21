"use client";

import { useState } from "react";

interface CloudinaryUploaderProps {
  onUploadComplete: (url: string) => void;
  label: string;
  multiple?: boolean;
  className?: string;
}

interface CloudinarySignatureResponse {
  cloudName?: string;
  apiKey?: string;
  folder?: string;
  timestamp?: number;
  signature?: string;
  error?: string;
}

interface CloudinaryUploadSignature {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

async function getUploadSignature(): Promise<CloudinaryUploadSignature> {
  const response = await fetch("/api/admin/cloudinary-signature", {
    method: "POST",
  });
  const data: CloudinarySignatureResponse = await response.json();

  if (!response.ok || !data.cloudName || !data.apiKey || !data.folder || !data.timestamp || !data.signature) {
    throw new Error(data.error ?? "No se pudo preparar la subida a Cloudinary.");
  }

  return {
    cloudName: data.cloudName,
    apiKey: data.apiKey,
    folder: data.folder,
    timestamp: data.timestamp,
    signature: data.signature,
  };
}

export default function CloudinaryUploader({ onUploadComplete, label, multiple = false, className = "" }: CloudinaryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      throw new Error("Formato no permitido. Usa JPG, PNG, WebP, GIF o AVIF.");
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("La imagen no puede superar 10 MB.");
    }
    const signature = await getUploadSignature();
    const formData = new FormData();

    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", String(signature.timestamp));
    formData.append("signature", signature.signature);
    formData.append("folder", signature.folder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
    const data: { secure_url?: string; error?: { message?: string } } = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message ?? "No se pudo subir la imagen a Cloudinary.");
    }

    if (!data.secure_url) {
      throw new Error("Cloudinary no devolvio una URL segura.");
    }

    return data.secure_url;
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setError(null);
    setUploading(true);

    try {
      for (const file of files) {
        const secureUrl = await uploadFile(file);
        onUploadComplete(secureUrl);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="grid gap-2">
      <label className={`inline-flex min-w-0 cursor-pointer items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-center text-xs uppercase tracking-[0.2em] text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900 sm:tracking-[0.28em] ${uploading ? "cursor-not-allowed opacity-60" : ""} ${className}`}>
        <span>{uploading ? "Subiendo" : label}</span>
        <input type="file" accept="image/*" multiple={multiple} onChange={handleChange} className="hidden" disabled={uploading} />
      </label>
      {error ? <p className="max-w-sm text-xs leading-5 text-red-300">{error}</p> : null}
    </div>
  );
}
