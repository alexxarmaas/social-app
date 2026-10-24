"use client";

import { useState } from "react";

type Application = { id: string; user: { username: string; name: string | null } };

export default function ApplicationsPanel({ clubId, initial }: { clubId: string; initial: Application[] }) {
  const [pending, setPending] = useState(initial);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function act(membershipId: string, action: "approved" | "rejected") {
    setBusy(membershipId); setError("");
    try {
      const response = await fetch("/api/clubs/" + clubId + "/applications", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId, action }),
      });
      const result: { error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo resolver la solicitud.");
      setPending((old) => old.filter((member) => member.id !== membershipId));
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Error al actualizar."); }
    finally { setBusy(""); }
  }

  return (
    <section className="mt-9 space-y-4">
      {error ? <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}
      {pending.length ? pending.map((member) => (
        <div key={member.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 p-5">
          <div><p className="font-bold">@{member.user.username}</p><p className="text-xs text-zinc-500">{member.user.name}</p></div>
          <div className="flex gap-2">
            <button type="button" disabled={Boolean(busy)} onClick={() => act(member.id, "approved")} className="rounded-lg bg-lime-300 px-4 py-2 text-xs font-bold text-black disabled:opacity-50">Aceptar</button>
            <button type="button" disabled={Boolean(busy)} onClick={() => act(member.id, "rejected")} className="rounded-lg border border-white/20 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Rechazar</button>
          </div>
        </div>
      )) : <p className="rounded-2xl border border-white/10 p-8 text-sm text-zinc-400">No tienes solicitudes pendientes.</p>}
    </section>
  );
}
