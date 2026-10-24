"use client";

import { useState } from "react";

export function CarShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: title + " | Tramassso", url }); } catch { /* Share dismissed. */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      } catch {
        window.prompt("Copia este enlace:", url);
      }
    }
  }
  return <button type="button" onClick={share} className="rounded-xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-black hover:bg-orange-400">{copied ? "Enlace copiado" : "Compartir coche ↗"}</button>;
}
