"use client";

import { useState } from "react";
import Link from "next/link";

export default function MembershipButton({ clubId, initialStatus, signedIn }: {
  clubId: string;
  initialStatus: string;
  signedIn: boolean;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!signedIn) return <Link href={"/login?next=" + encodeURIComponent("/clubs/" + clubId)} className="inline-flex rounded-xl bg-orange-500 px-6 py-3 text-xs font-black uppercase text-black">Entrar para unirme ↗</Link>;
  async function toggle() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/clubs/" + clubId + "/membership", { method: status === "none" ? "POST" : "DELETE" });
      const result: { status?: string; error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo procesar la solicitud.");
      setStatus(result.status || "none");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Error al conectar."); }
    finally { setBusy(false); }
  }
  return (
    <div>
      <button onClick={toggle} type="button" disabled={busy} className="rounded-xl border border-orange-500 bg-orange-500 px-6 py-3 text-xs font-black uppercase text-black disabled:opacity-60">
        {busy ? "Procesando..." : status === "pending" ? "Cancelar solicitud pendiente" : status === "approved" ? "Salir del club" : status === "rejected" ? "Retirar solicitud rechazada" : "Solicitar unirme"}
      </button>
      {error ? <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p> : null}
      {status === "pending" ? <p className="mt-2 text-xs text-zinc-400">El administrador revisara tu solicitud.</p> : null}
    </div>
  );
}
