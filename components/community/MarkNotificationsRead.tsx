"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkNotificationsRead({ count }: { count: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function markAllRead() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/community/notifications/read", { method: "POST" });
      const result: { ok?: boolean; error?: string } = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "No se pudieron actualizar.");
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Error de conexión.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div>
      <button type="button" disabled={pending || count === 0} onClick={markAllRead}
        className="rounded-xl border border-orange-500/50 px-5 py-3 text-xs font-black uppercase tracking-widest text-orange-400 disabled:opacity-40">
        {pending ? "Actualizando…" : "Marcar todas como leídas"}
      </button>
      {error ? <p role="alert" className="mt-3 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
