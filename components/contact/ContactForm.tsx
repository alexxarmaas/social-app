"use client";

import { useState } from "react";
import { MdEmail } from "react-icons/md";

export default function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data: { error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No se pudo enviar la solicitud.");
      form.reset();
      setState("success");
      setMessage("Solicitud recibida. La revisaremos desde el panel de Tramassso.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "No se pudo enviar la solicitud.");
    }
  }

  return (
    <form onSubmit={submit} className="grid min-w-0 gap-3 rounded-[1.2rem] border border-white/10 bg-black/40 p-4 sm:gap-4 sm:rounded-[1.6rem] sm:p-5">
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        <input aria-label="Nombre" name="name" required minLength={2} placeholder="Nombre" className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600" />
        <input aria-label="Correo electronico" name="email" required type="email" placeholder="Correo electronico" className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600" />
      </div>
      <input aria-label="Marca o empresa" name="brand" required minLength={2} placeholder="Marca o empresa" className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600" />
      <textarea aria-label="Propuesta de colaboracion" name="brief" required minLength={10} rows={4} placeholder="Que quieres activar" className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600" />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className={`text-xs ${state === "error" ? "text-red-300" : state === "success" ? "text-emerald-300" : "text-zinc-500"}`}>{message || "La solicitud se guarda de forma segura en nuestro panel."}</p>
        <button type="submit" disabled={state === "sending"} className="racing-button inline-flex items-center rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] disabled:opacity-50">
          <MdEmail size={16} /><span className="ml-2">{state === "sending" ? "Enviando" : "Enviar solicitud"}</span>
        </button>
      </div>
    </form>
  );
}
