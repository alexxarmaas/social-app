"use client";

import { useMemo, useState } from "react";
import type { EventRegistrationRecord, RegistrationStatus } from "@/app/lib/event-registrations";

const statusLabels: Record<RegistrationStatus, string> = { new: "Nueva", confirmed: "Confirmada", cancelled: "Cancelada" };

function csvCell(value: unknown) {
  const text = String(value ?? "");
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export default function AdminEventRegistrations({ initialItems }: { initialItems: EventRegistrationRecord[] }) {
  const [items, setItems] = useState(initialItems);
  const [eventFilter, setEventFilter] = useState("all");
  const [message, setMessage] = useState<string | null>(null);
  const events = useMemo(() => Array.from(new Map(items.map((item) => [item.event_id, item.event_title])).entries()), [items]);
  const visible = eventFilter === "all" ? items : items.filter((item) => item.event_id === eventFilter);

  async function update(id: string, status: RegistrationStatus) {
    setMessage(null);
    const response = await fetch("/api/admin/event-registrations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    const data: { success?: boolean; error?: string } = await response.json();
    if (!response.ok || !data.success) return setMessage(data.error ?? "No se pudo actualizar.");
    setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    setMessage("Inscripcion actualizada.");
  }

  async function remove(id: string) {
    if (!window.confirm("¿Eliminar definitivamente esta inscripcion?")) return;
    const response = await fetch("/api/admin/event-registrations", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const data: { success?: boolean; error?: string } = await response.json();
    if (!response.ok || !data.success) return setMessage(data.error ?? "No se pudo eliminar.");
    setItems((current) => current.filter((item) => item.id !== id));
    setMessage("Inscripcion eliminada.");
  }

  function exportCsv() {
    const rows = [
      ["Evento", "Fecha", "Tipo", "Nombre", "Email", "Telefono", "Vehiculo", "Acompañantes", "Estado", "Recibida"],
      ...visible.map((item) => [item.event_title, item.event_date, item.participation_mode, item.name, item.email, item.phone, item.vehicle, item.companions, statusLabels[item.status], item.created_at]),
    ];
    const blob = new Blob([`\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `tramassso-inscripciones-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950/80 p-4 sm:rounded-[1.75rem] sm:p-5">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">Participacion</p><h2 className="mt-2 text-2xl font-semibold text-white">Inscripciones e interesados</h2></div>
        <div className="flex flex-wrap gap-2">
          <select value={eventFilter} onChange={(event) => setEventFilter(event.target.value)} className="rounded-full border border-zinc-800 bg-black px-4 py-2 text-xs text-zinc-300"><option value="all">Todos los eventos</option>{events.map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select>
          <button type="button" onClick={exportCsv} disabled={!visible.length} className="rounded-full border border-zinc-700 px-4 py-2 text-xs uppercase tracking-[0.22em] text-zinc-200 disabled:opacity-40">Exportar CSV</button>
        </div>
      </div>
      {message ? <p className="mb-4 text-sm text-zinc-300">{message}</p> : null}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="min-w-[72rem] divide-y divide-zinc-800 text-sm">
          <thead className="bg-zinc-900/70 text-left text-[10px] uppercase tracking-[0.28em] text-zinc-500"><tr><th className="px-4 py-3">Evento</th><th className="px-4 py-3">Persona</th><th className="px-4 py-3">Contacto</th><th className="px-4 py-3">Vehiculo</th><th className="px-4 py-3">Grupo</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3"></th></tr></thead>
          <tbody className="divide-y divide-zinc-900 bg-black/20">
            {visible.map((item) => <tr key={item.id} className="align-top"><td className="px-4 py-4"><p className="font-medium text-white">{item.event_title}</p><p className="mt-1 text-xs text-zinc-500">{item.participation_mode === "managed" ? "Inscripcion" : "Interes"}</p></td><td className="px-4 py-4 text-zinc-200">{item.name}</td><td className="px-4 py-4"><a href={`mailto:${item.email}`} className="text-zinc-200 hover:text-white">{item.email}</a><p className="text-xs text-zinc-500">{item.phone || "Sin telefono"}</p></td><td className="px-4 py-4 text-zinc-400">{item.vehicle || "—"}</td><td className="px-4 py-4 text-zinc-300">{1 + item.companions}</td><td className="px-4 py-4"><select value={item.status} onChange={(event) => void update(item.id, event.target.value as RegistrationStatus)} className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td><td className="px-4 py-4 text-right"><button onClick={() => void remove(item.id)} className="text-xs text-zinc-500 hover:text-red-300">Eliminar</button></td></tr>)}
            {!visible.length ? <tr><td colSpan={7} className="px-4 py-8 text-center text-xs uppercase tracking-[0.3em] text-zinc-600">No hay inscripciones</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
