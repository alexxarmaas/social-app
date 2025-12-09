"use client";

import { useState, useRef } from "react";
import { createPost } from "@/app/actions/post";
import Image from "next/image";
import { useSession } from "next-auth/react";
import ProtectedLink from "./ProtectedLink";
import { usePathname } from "next/navigation";

export default function CreatePost() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("content", content);
    if (image) {
      formData.append("image", image);
    }

    try {
      const result = await createPost(formData);
      if (result.error) {
        setError(result.error);
      } else {
        // Reset form
        setContent("");
        setImage(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err) {
      setError("Error al publicar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 mb-6">
      {session ? (
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shrink-0 overflow-hidden relative">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  fill
                  className="object-fill"
                  unoptimized
                />
              ) : (
                <span>{session?.user?.name?.[0] || "Yo"}</span>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="¿Qué estás pensando? Comparte tu coche..."
                className="w-full bg-slate-700/50 text-white placeholder-slate-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[80px] resize-none"
              />

              {preview && (
                <div className="mt-3 relative w-full h-48 bg-slate-900/50 rounded-lg overflow-hidden">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-fill"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                  >
                    ✕
                  </button>
                </div>
              )}

              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}

              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-slate-700/50"
                    title="Añadir imagen"
                  >
                    📷
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || (!content.trim() && !image)}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Publicando..." : "Publicar"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="text-slate-400">Inicia sesión para crear publicaciones.</div>
          <ProtectedLink href={`/login?next=${encodeURIComponent(pathname || '/')}`} className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg">Iniciar sesión</ProtectedLink>
        </div>
      )}
    </div>
  );
}
