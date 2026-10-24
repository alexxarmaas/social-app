"use client";
import { useState } from "react";
export default function CheckinConfirmation({ eventId, token, alreadyUsed }: { eventId: string; token: string; alreadyUsed: boolean }) {
  const [used, setUsed] = useState(alreadyUsed);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function checkin() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/checkin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, token }),
      });
      const data: { success?: boolean; error?: string } = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "No se pudo validar.");
      setUsed(true);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Error de conexion."); }
    finally { setBusy(false); }
  }
  return <div className="mt-8">
    {used ? <p role="status" className="rounded-xl border border-orange-500/40 bg-orange-500/10 p-5 text-center font-bold text-orange-300">Entrada utilizada · Acceso registrado</p> :
      <button type="button" disabled={busy} onClick={checkin} className="w-full rounded-xl bg-orange-500 px-6 py-5 text-sm font-black uppercase tracking-wider text-black hover:bg-orange-400 disabled:opacity-50">{busy ? "Validando..." : "Confirmar acceso al evento"}</button>}
    {error ? <p role="alert" className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}
    <p className="mt-4 text-xs leading-6 text-zinc-500">La validacion consume la entrada. No pulses confirmar hasta comprobar el vehiculo y sus ocupantes.</p>
  </div>;
}
