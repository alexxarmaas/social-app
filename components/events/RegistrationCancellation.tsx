"use client";
import { useState } from "react";
export default function RegistrationCancellation({ registrationId }: { registrationId: string }) {
  const [busy, setBusy] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState("");
  async function cancel() {
    if (!window.confirm("¿Cancelar tu solicitud y liberar la plaza? Esta accion no se puede deshacer.")) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/community/registrations/" + registrationId + "/cancel", { method: "POST" });
      const result: { ok?: boolean; error?: string } = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "No pudimos cancelar.");
      setCancelled(true);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Error de conexion."); }
    finally { setBusy(false); }
  }
  return <div className="text-right">
    {cancelled ? <p role="status" className="text-xs font-semibold text-orange-400">Solicitud cancelada.</p> :
      <button type="button" disabled={busy} onClick={cancel} className="rounded-xl border border-red-500/40 px-4 py-3 text-xs font-bold uppercase text-red-300 disabled:opacity-50">{busy ? "Cancelando..." : "Cancelar plaza"}</button>}
    {error ? <p role="alert" className="mt-2 text-xs text-red-300">{error}</p> : null}
  </div>;
}
