"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function ClubForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Multimarca");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = "mt-2 w-full rounded-xl border border-white/15 bg-zinc-950 px-4 py-3 text-base text-white outline-none focus:border-orange-500";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/clubs", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, category, location }),
      });
      const result: { id?: string; error?: string } = await response.json();
      if (!response.ok || !result.id) throw new Error(result.error || "No se pudo crear el club.");
      router.push("/clubs/" + result.id);
      router.refresh();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Error inesperado."); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="mt-9 space-y-5 rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-300">Nombre del club
        <input required minLength={3} maxLength={70} className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="El nombre de tu grupo" />
      </label>
      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-300">Tipo de coches
        <select className={input} value={category} onChange={(e) => setCategory(e.target.value)}>
          {["Multimarca", "JDM", "Europeos", "Clasicos", "Americanos", "Tuning", "Otros"].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-300">Ubicacion
        <input maxLength={90} className={input} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Gran Canaria" />
      </label>
      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-300">Presentacion
        <textarea rows={5} maxLength={1600} className={input} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Cuenta de que va vuestro club..." />
      </label>
      {error ? <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}
      <button disabled={busy} type="submit" className="rounded-xl bg-orange-500 px-7 py-3.5 text-xs font-black uppercase tracking-widest text-black disabled:opacity-50">{busy ? "Creando..." : "Crear club gratuito"}</button>
    </form>
  );
}
