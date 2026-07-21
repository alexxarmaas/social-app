"use client";

import { useState } from "react";
import type { ContactRequestRecord } from "@/app/lib/tramassso-content";

export default function AdminContactRequests({ initialItems }: { initialItems: ContactRequestRecord[] }) {
  const [items, setItems] = useState(initialItems);
  const [message, setMessage] = useState("");

  async function update(id: string, status: ContactRequestRecord["status"]) {
    const response = await fetch("/api/admin/contact-requests", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (!response.ok) return setMessage("No se pudo actualizar la solicitud.");
    setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    setMessage("Solicitud actualizada.");
  }

  async function remove(id: string) {
    if (!window.confirm("¿Eliminar esta solicitud?")) return;
    const response = await fetch("/api/admin/contact-requests", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (!response.ok) return setMessage("No se pudo eliminar la solicitud.");
    setItems((current) => current.filter((item) => item.id !== id));
    setMessage("Solicitud eliminada.");
  }

  return (
    <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Contacto</p><h2 className="mt-2 text-2xl font-semibold text-white">Solicitudes de empresas</h2></div>
        <p className="text-xs text-zinc-500">{message || `${items.filter((item) => item.status === "nuevo").length} nuevas`}</p>
      </div>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-semibold text-white">{item.brand}</p><p className="text-sm text-zinc-400">{item.name} · <a className="underline" href={`mailto:${item.email}`}>{item.email}</a></p></div>
              <span className="rounded-full border border-zinc-700 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-300">{item.status}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{item.brief}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["nuevo", "visto", "respondido"] as const).map((status) => <button key={status} type="button" onClick={() => void update(item.id, status)} className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:text-white">{status}</button>)}
              <button type="button" onClick={() => void remove(item.id)} className="rounded-full border border-red-900 px-3 py-1.5 text-xs text-red-300">Eliminar</button>
            </div>
          </article>
        ))}
        {!items.length ? <p className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center text-sm text-zinc-500">Todavia no hay solicitudes.</p> : null}
      </div>
    </section>
  );
}
