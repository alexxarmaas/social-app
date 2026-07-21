"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";

const STORAGE_KEY = "tramassso-ads-consent";

export default function AdsConsent({ clientId }: { clientId: string }) {
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const frame = window.requestAnimationFrame(() => {
      if (stored === "accepted" || stored === "rejected") setConsent(stored);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const choose = (value: "accepted" | "rejected") => {
    window.localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);
  };

  return (
    <>
      {consent === "accepted" ? (
        <Script
          id="adsense-script"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
          crossOrigin="anonymous"
        />
      ) : null}
      {consent === null ? (
        <aside className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-2xl rounded-2xl border border-white/15 bg-zinc-950/95 p-4 text-sm text-zinc-300 shadow-2xl backdrop-blur" aria-label="Preferencias de privacidad">
          <p>Usamos anuncios de Google solo con tu permiso. Puedes consultar los detalles en la <Link className="underline" href="/privacidad">politica de privacidad</Link>.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="rounded-full bg-white px-4 py-2 font-medium text-black" type="button" onClick={() => choose("accepted")}>Aceptar anuncios</button>
            <button className="rounded-full border border-white/20 px-4 py-2" type="button" onClick={() => choose("rejected")}>Rechazar</button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
