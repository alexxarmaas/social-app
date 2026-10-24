"use client";
import { useState, type ChangeEvent } from "react";
import Image from "next/image";

type Photo = { id: string; url: string; caption: string | null };
export default function PhotoGalleryEditor({ carId, initial }: { carId: string; initial: Photo[] }) {
  const [photos, setPhotos] = useState(initial);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function add(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(""); setMessage("");
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError("Usa JPG, PNG, WebP o AVIF de hasta 10 MB."); return;
    }
    setBusy(true);
    try {
      const signatureResponse = await fetch("/api/garage/upload-signature", { method: "POST" });
      const signed: { error?: string; cloudName?: string; apiKey?: string; folder?: string; timestamp?: number; signature?: string } = await signatureResponse.json();
      if (!signatureResponse.ok || !signed.cloudName || !signed.apiKey || !signed.folder || !signed.timestamp || !signed.signature)
        throw new Error(signed.error || "Error preparando la subida.");
      const data = new FormData();
      data.append("file", file); data.append("api_key", signed.apiKey);
      data.append("folder", signed.folder); data.append("timestamp", String(signed.timestamp)); data.append("signature", signed.signature);
      const response = await fetch("https://api.cloudinary.com/v1_1/" + signed.cloudName + "/image/upload", { method: "POST", body: data });
      const uploaded: { secure_url?: string; error?: { message?: string } } = await response.json();
      if (!response.ok || !uploaded.secure_url) throw new Error(uploaded.error?.message || "Error al subir a Cloudinary.");
      const saved = await fetch("/api/garage/" + carId + "/photos", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: uploaded.secure_url, caption }),
      });
      const result: { photo?: Photo; error?: string } = await saved.json();
      if (!saved.ok || !result.photo) throw new Error(result.error || "No se pudo guardar.");
      setPhotos((items) => [...items, result.photo as Photo]);
      setCaption(""); setMessage("Foto añadida al garaje.");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo subir."); }
    finally { setBusy(false); event.target.value = ""; }
  }

  async function remove(id: string) {
    if (!window.confirm("¿Quitar esta foto de la galeria?")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/garage/" + carId + "/photos/" + id, { method: "DELETE" });
      const data: { error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo eliminar.");
      setPhotos((items) => items.filter((photo) => photo.id !== id));
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Error al eliminar."); }
    finally { setBusy(false); }
  }
  return <section className="mt-9 rounded-3xl border border-white/10 bg-zinc-900/50 p-6">
    <h2 className="text-2xl font-black uppercase">Galeria de fotos</h2>
    <p className="mt-3 text-sm text-zinc-400">Hasta ocho fotografias adicionales. Evita matriculas o ubicaciones privadas.</p>
    {photos.length ? <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((photo) => <div key={photo.id} className="overflow-hidden rounded-xl border border-white/10">
        <div className="relative aspect-[4/3]"><Image src={photo.url} alt={photo.caption || "Foto de vehiculo"} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover" /></div>
        <button disabled={busy} type="button" onClick={() => remove(photo.id)} className="w-full px-2 py-3 text-xs text-red-300 disabled:opacity-50">Eliminar</button>
      </div>)}
    </div> : null}
    {photos.length < 8 ? <div className="mt-6 space-y-3">
      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">Pie de foto (opcional)
        <input maxLength={160} value={caption} onChange={(e) => setCaption(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black p-3 text-base text-white" />
      </label>
      <label className="inline-block cursor-pointer rounded-xl bg-orange-500 px-5 py-3 text-xs font-bold uppercase text-black">
        {busy ? "Procesando..." : "Añadir fotografia"}
        <input disabled={busy} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={add} className="sr-only" />
      </label>
    </div> : <p className="mt-4 text-xs text-orange-300">Has alcanzado el maximo de fotos.</p>}
    {error ? <p role="alert" className="mt-3 text-xs text-red-300">{error}</p> : null}
    {message ? <p role="status" className="mt-3 text-xs text-orange-300">{message}</p> : null}
  </section>;
}
