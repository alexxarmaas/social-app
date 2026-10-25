"use client";
import { track } from "@vercel/analytics/react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function PostComposer({ clubId }: { clubId?: string } = {}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError("Utiliza JPG, PNG, WebP o AVIF, de hasta 10 MB.");
      return;
    }
    setUploading(true);
    try {
      const response = await fetch("/api/garage/upload-signature", { method: "POST" });
      const signed: { error?: string; cloudName?: string; apiKey?: string; timestamp?: number; signature?: string; folder?: string } = await response.json();
      if (!response.ok || !signed.cloudName || !signed.apiKey || !signed.timestamp || !signed.signature || !signed.folder) {
        throw new Error(signed.error || "No se pudo preparar la subida.");
      }
      const data = new FormData();
      data.append("file", file);
      data.append("api_key", signed.apiKey);
      data.append("timestamp", String(signed.timestamp));
      data.append("signature", signed.signature);
      data.append("folder", signed.folder);
      const result = await fetch("https://api.cloudinary.com/v1_1/" + signed.cloudName + "/image/upload", { method: "POST", body: data });
      const uploaded: { secure_url?: string; error?: { message?: string } } = await result.json();
      if (!result.ok || !uploaded.secure_url) throw new Error(uploaded.error?.message || "No se pudo subir.");
      setImageUrl(uploaded.secure_url);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Error al subir."); }
    finally { setUploading(false); event.target.value = ""; }
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/community/posts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, imageUrl, ...(clubId ? { clubId } : {}) }),
      });
      const result: { error?: string; status?: string } = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo publicar.");
      track("Community_Post_Submitted", { context: clubId ? "club" : "global" });
      setMessage("¡Gracias! Tu publicacion se ha enviado a moderacion. Aparecera al aprobarse.");
      setContent(""); setImageUrl(""); router.refresh();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Error de conexion."); }
    finally { setBusy(false); }
  }

  return <form onSubmit={submit} className="rounded-3xl border border-orange-500/20 bg-zinc-900/60 p-6">
    <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">Comparte con la comunidad</p>
    <label className="mt-5 block text-sm text-zinc-300">
      ¿Que has hecho con tu coche?
      <textarea required minLength={8} maxLength={1200} rows={4} value={content} onChange={(e) => setContent(e.target.value)}
        placeholder="Una modificacion, una ruta, una idea..." className="mt-3 w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-base text-white outline-none focus:border-orange-500" />
    </label>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <label className="cursor-pointer rounded-xl border border-white/20 px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:border-orange-500">
        {uploading ? "Subiendo..." : imageUrl ? "Foto cargada ✓" : "Añadir foto"}
        <input disabled={uploading || busy} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={upload} className="sr-only" />
      </label>
      <span className="text-xs text-zinc-500">{content.length}/1200</span>
    </div>
    {imageUrl ? <button type="button" onClick={() => setImageUrl("")} className="mt-3 text-xs text-orange-400 underline">Quitar foto</button> : null}
    {error ? <p role="alert" className="mt-4 text-sm text-red-300">{error}</p> : null}
    {message ? <p role="status" className="mt-4 text-sm text-orange-300">{message}</p> : null}
    <button disabled={busy || uploading} className="mt-5 rounded-xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-black hover:bg-orange-400 disabled:opacity-50">{busy ? "Enviando..." : "Enviar publicacion"}</button>
  </form>;
}
