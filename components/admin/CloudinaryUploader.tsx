"use client";

import { useState } from "react";

interface CloudinaryUploaderProps {
  onUploadComplete: (url: string) => void;
  label: string;
  multiple?: boolean;
  className?: string;
}

export default function CloudinaryUploader({ onUploadComplete, label, multiple = false, className = "" }: CloudinaryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const uploadFile = async (file: File) => {
    if (!cloudName || !uploadPreset) {
      throw new Error("Missing Cloudinary upload configuration");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Cloudinary upload failed");
    }

    const data: { secure_url?: string } = await response.json();

    if (!data.secure_url) {
      throw new Error("Cloudinary did not return a secure URL");
    }

    return data.secure_url;
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setUploading(true);

    try {
      for (const file of files) {
        const secureUrl = await uploadFile(file);
        onUploadComplete(secureUrl);
      }
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <label
      className={`inline-flex cursor-pointer items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs uppercase tracking-[0.28em] text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <span>{uploading ? "Uploading" : label}</span>
      <input type="file" accept="image/*" multiple={multiple} onChange={handleChange} className="hidden" disabled={uploading} />
    </label>
  );
}