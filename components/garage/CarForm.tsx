"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

type FormFields = {
  make: string;
  model: string;
  year: number;
  color: string;
  engine: string;
  horsepower: number | null;
  modifications: string;
  description: string;
  imageUrl: string;
};

export default function CarForm({ initial, carId }: { initial?: Partial<FormFields>; carId?: string }) {
  const router = useRouter();
  const [fields, setFields] = useState<FormFields>({
    make: initial?.make || "",
    model: initial?.model || "",
    year: initial?.year || new Date().getFullYear(),
    color: initial?.color || "",
    engine: initial?.engine || "",
    horsepower: initial?.horsepower ?? null,
    modifications: initial?.modifications || "",
    description: initial?.description || "",
    imageUrl: initial?.imageUrl || "",
  });
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setFields((old) => ({ ...old, [key]: value }));
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!validTypes.includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError("Selecciona JPG, PNG, WebP o AVIF de hasta 10 MB.");
      return;
    }
    setUploading(true);
    try {
      const signedResponse = await fetch("/api/garage/upload-signature", { method: "POST" });
      const signed: { error?: string; cloudName?: string; apiKey?: string; timestamp?: number; folder?: string; signature?: string } = await signedResponse.json();
      if (!signedResponse.ok || !signed.cloudName || !signed.apiKey || !signed.timestamp || !signed.folder || !signed.signature) {
        throw new Error(signed.error || "No se pudo preparar la subida.");
      }
      const data = new FormData();
      data.append("file", file);
      data.append("api_key", signed.apiKey);
      data.append("timestamp", String(signed.timestamp));
      data.append("folder", signed.folder);
      data.append("signature", signed.signature);
      const response = await fetch("https://api.cloudinary.com/v1_1/" + signed.cloudName + "/image/upload", { method: "POST", body: data });
      const uploaded: { secure_url?: string; error?: { message?: string } } = await response.json();
      if (!response.ok || !uploaded.secure_url) throw new Error(uploaded.error?.message || "Error al subir foto.");
      update("imageUrl", uploaded.secure_url);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudo subir la foto.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(carId ? "/api/garage/" + carId : "/api/garage", {
        method: carId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const result: { id?: string; error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error || "No hemos podido guardar el coche.");
      router.push("/garage/" + (carId || result.id));
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No hemos podido guardar el coche.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!carId || !window.confirm("¿Eliminar esta ficha de manera permanente?")) return;
    setBusy(true);
    try {
      const response = await fetch("/api/garage/" + carId, { method: "DELETE" });
      if (!response.ok) throw new Error("No se pudo eliminar el coche.");
      router.push("/garage/mine");
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Error al eliminar.");
      setBusy(false);
    }
  }

  const inputClass = "mt-2 w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-base text-white outline-none focus:border-lime-300";
  return (
    <form onSubmit={save} className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-300">Marca *
          <input required minLength={2} maxLength={50} value={fields.make} onChange={(e) => update("make", e.target.value)} placeholder="Honda" className={inputClass} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-300">Modelo *
          <input required maxLength={70} value={fields.model} onChange={(e) => update("model", e.target.value)} placeholder="Prelude" className={inputClass} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-300">Año *
          <input required type="number" min={1900} max={new Date().getFullYear() + 1} value={fields.year} onChange={(e) => update("year", Number(e.target.value))} className={inputClass} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-300">Color
          <input maxLength={40} value={fields.color} onChange={(e) => update("color", e.target.value)} placeholder="Blanco" className={inputClass} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-300">Motor
          <input maxLength={80} value={fields.engine} onChange={(e) => update("engine", e.target.value)} placeholder="F20A4" className={inputClass} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-300">Potencia (CV)
          <input type="number" min={1} max={3000} value={fields.horsepower ?? ""} onChange={(e) => update("horsepower", e.target.value ? Number(e.target.value) : null)} className={inputClass} />
        </label>
      </div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-300">Historia del coche
        <textarea rows={4} maxLength={2000} value={fields.description} onChange={(e) => update("description", e.target.value)} className={inputClass} placeholder="¿Que hace especial tu proyecto?" />
      </label>
      <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-300">Modificaciones
        <textarea rows={4} maxLength={2500} value={fields.modifications} onChange={(e) => update("modifications", e.target.value)} className={inputClass} placeholder="Suspension, llantas, motor, interior..." />
      </label>
      <div className="space-y-3 rounded-2xl border border-dashed border-white/20 p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-300">Fotografia principal</p>
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={upload} disabled={uploading || busy} className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-lime-300 file:px-4 file:py-2 file:font-bold file:text-black" />
        <p className="text-xs text-zinc-500">JPG, PNG, WebP o AVIF. Maximo 10 MB. Cloudinary debe estar configurado.</p>
        {fields.imageUrl ? <p className="break-all text-xs text-lime-300">Imagen lista: {fields.imageUrl}</p> : null}
        {uploading ? <p role="status" className="text-sm text-lime-300">Subiendo fotografia...</p> : null}
      </div>
      {error ? <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy || uploading} className="rounded-xl bg-lime-300 px-7 py-3.5 text-xs font-black uppercase tracking-widest text-black hover:bg-lime-200 disabled:opacity-60">{busy ? "Guardando..." : carId ? "Guardar cambios" : "Publicar en Garage"}</button>
        {carId ? <button type="button" disabled={busy} onClick={remove} className="rounded-xl border border-rose-500/40 px-6 py-3 text-xs font-bold uppercase text-rose-200 disabled:opacity-50">Eliminar ficha</button> : null}
      </div>
    </form>
  );
}
