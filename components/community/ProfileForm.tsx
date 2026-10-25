"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function ProfileForm({ initial }: { initial: { name: string; bio: string; location: string } }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [bio, setBio] = useState(initial.bio);
  const [location, setLocation] = useState(initial.location);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const input = "mt-2 w-full rounded-xl border border-white/15 bg-zinc-950 px-4 py-3 text-base normal-case tracking-normal text-white outline-none focus:border-orange-500";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/community/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, location }),
      });
      const data: { ok?: boolean; error?: string } = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "No se pudo guardar.");
      setMessage("Perfil actualizado. Los cambios ya aparecen en tu pagina publica.");
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No pudimos conectar.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-9 space-y-6 rounded-3xl border border-white/10 bg-zinc-900/40 p-6 sm:p-9">
      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">Nombre publico
        <input required minLength={2} maxLength={70} autoComplete="name" className={input} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">Biografia
        <textarea rows={5} maxLength={1200} className={input} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="¿Qué te gusta del motor?" />
        <span className="mt-2 block text-[11px] normal-case tracking-normal text-zinc-500">{bio.length}/1200 caracteres</span>
      </label>
      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">Zona (publica, opcional)
        <input maxLength={80} className={input} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Gran Canaria, no tu direccion" />
        <span className="mt-2 block text-[11px] normal-case tracking-normal text-zinc-500">Indica solo tu ciudad o isla, nunca una direccion privada.</span>
      </label>
      {error ? <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</p> : null}
      {message ? <p role="status" className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-orange-200">{message}</p> : null}
      <button disabled={pending} type="submit" className="rounded-xl bg-orange-500 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-orange-400 disabled:opacity-60">{pending ? "Guardando..." : "Guardar perfil"}</button>
    </form>
  );
}
