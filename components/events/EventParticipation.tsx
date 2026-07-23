"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import type { EventRecord } from "@/app/lib/tramassso-content";

function formatLicensePlateInput(value: string) {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  if (/^\d{4}[A-Z]{0,3}$/.test(compact) && compact.length > 4) {
    return `${compact.slice(0, 4)} ${compact.slice(4)}`;
  }
  return compact;
}

export default function EventParticipation({ event, remaining }: { event: EventRecord; remaining: number | null }) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (event.participation_mode === "information") {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-zinc-400">
        Publicacion informativa de Tramassso. Consulta siempre las indicaciones del organizador antes de desplazarte.
      </div>
    );
  }

  if (event.participation_mode === "external") {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm leading-7 text-zinc-400">La inscripcion la gestiona {event.organizer_name || "el organizador externo"}. Tramassso no recibe tus datos.</p>
        {event.external_registration_url ? (
          <a href={event.external_registration_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full bg-white px-5 py-3 text-xs font-medium uppercase tracking-[0.24em] text-black transition hover:bg-zinc-200">
            Ir a la inscripcion oficial
          </a>
        ) : null}
      </div>
    );
  }

  const isManaged = event.participation_mode === "managed";
  const full = isManaged && remaining === 0;

  async function submit(eventForm: FormEvent<HTMLFormElement>) {
    eventForm.preventDefault();
    setSending(true);
    setMessage(null);
    const form = eventForm.currentTarget;
    const values = new FormData(form);

    try {
      const response = await fetch(`/api/events/${event.id}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.get("name"),
          email: values.get("email"),
          phone: values.get("phone"),
          vehicle: values.get("vehicle"),
          license_plate: values.get("license_plate"),
          companions: isManaged ? values.get("companions") || 0 : 0,
          privacy: values.get("privacy") === "on",
          website: values.get("website"),
        }),
      });
      const data: { success?: boolean; error?: string } = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error ?? "No se pudo enviar la solicitud.");
      form.reset();
      setMessage(isManaged ? "Solicitud recibida. Te enviaremos un correo y Tramassso revisara la plaza." : "Interes registrado. Te avisaremos si hay novedades.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo enviar la solicitud.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="rounded-[1.75rem] border border-red-500/20 bg-red-500/[0.06] p-5 sm:p-6">
      <p className="text-[10px] uppercase tracking-[0.4em] text-red-300">{isManaged ? "Inscripcion Tramassso" : "Lista de interesados"}</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">{isManaged ? "Solicita tu plaza" : "Recibe novedades del evento"}</h2>
      <p className="mt-3 text-sm leading-7 text-zinc-400">
        {isManaged
          ? "La solicitud la gestiona Tramassso. Enviarla no confirma la plaza hasta que la revisemos."
          : "Tramassso guardara tu interes de forma independiente. Esto no equivale a la inscripcion oficial del organizador."}
      </p>
      {isManaged && remaining !== null ? <p className="mt-3 text-xs uppercase tracking-[0.24em] text-zinc-300">{remaining} plazas disponibles</p> : null}

      {full ? (
        <p className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">El aforo esta completo.</p>
      ) : (
        <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <input name="website" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px]" aria-hidden="true" />
          <label className="grid gap-2"><span className="text-xs uppercase tracking-[0.22em] text-zinc-500">Nombre</span><input name="name" required maxLength={120} autoComplete="name" className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none focus:border-zinc-400" /></label>
          <label className="grid gap-2"><span className="text-xs uppercase tracking-[0.22em] text-zinc-500">Correo</span><input name="email" type="email" required maxLength={160} autoComplete="email" className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none focus:border-zinc-400" /></label>
          <label className="grid gap-2"><span className="text-xs uppercase tracking-[0.22em] text-zinc-500">Telefono (opcional)</span><input name="phone" type="tel" maxLength={40} autoComplete="tel" className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none focus:border-zinc-400" /></label>
          <label className="grid gap-2"><span className="text-xs uppercase tracking-[0.22em] text-zinc-500">Marca y modelo</span><input name="vehicle" required minLength={2} maxLength={160} placeholder="Volkswagen Polo GTI" autoComplete="off" className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none focus:border-zinc-400" /></label>
          <label className="grid gap-2"><span className="text-xs uppercase tracking-[0.22em] text-zinc-500">Matricula</span><input name="license_plate" required minLength={4} maxLength={16} placeholder="1234 ABC" autoCapitalize="characters" autoCorrect="off" spellCheck={false} onInput={(event) => { event.currentTarget.value = formatLicensePlateInput(event.currentTarget.value); }} className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 uppercase text-white outline-none focus:border-zinc-400" /></label>
          {isManaged ? <label className="grid gap-2 sm:max-w-48"><span className="text-xs uppercase tracking-[0.22em] text-zinc-500">Acompañantes</span><input name="companions" type="number" min={0} max={20} defaultValue={0} className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none focus:border-zinc-400" /></label> : null}
          <p className="text-xs leading-5 text-zinc-500 sm:col-span-2">La marca, el modelo y la matricula son obligatorios para identificar el vehiculo y controlar el acceso al evento.</p>
          <label className="flex items-start gap-3 text-xs leading-6 text-zinc-400 sm:col-span-2"><input name="privacy" type="checkbox" required className="mt-1" /><span>Acepto que Tramassso trate estos datos para gestionar esta solicitud según la <Link href="/privacidad" className="text-white underline">politica de privacidad</Link>.</span></label>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <button disabled={sending} className="rounded-full bg-white px-5 py-3 text-xs font-medium uppercase tracking-[0.24em] text-black transition hover:bg-zinc-200 disabled:opacity-50">{sending ? "Enviando" : isManaged ? "Solicitar plaza" : "Me interesa"}</button>
            {message ? <p aria-live="polite" className="text-sm text-zinc-300">{message}</p> : null}
          </div>
        </form>
      )}
    </section>
  );
}
