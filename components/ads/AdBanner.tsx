"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getValidAdsenseClientId, isValidAdsenseSlot } from "@/app/lib/adsense";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

interface AdBannerProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
  label?: string;
}

export default function AdBanner({ slot, format = "auto", className = "", label = "Espacio patrocinado" }: AdBannerProps) {
  const pathname = usePathname();
  const adsenseClientId = getValidAdsenseClientId();
  const validSlot = isValidAdsenseSlot(slot) ? slot : null;

  useEffect(() => {
    if (!adsenseClientId || !validSlot || typeof window === "undefined") {
      return;
    }

    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  }, [adsenseClientId, pathname, validSlot]);

  if (!adsenseClientId || !validSlot) {
    return (
      <div className={`rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-4 text-[10px] uppercase tracking-[0.2em] text-zinc-500 sm:rounded-3xl sm:px-5 sm:text-xs sm:tracking-[0.3em] ${className}`}>
        {label}
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 sm:rounded-3xl ${className}`}>
      <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-zinc-500 sm:tracking-[0.35em]">{label}</div>
      <ins className="adsbygoogle block" style={{ display: "block" }} data-ad-client={adsenseClientId} data-ad-slot={validSlot} data-ad-format={format} data-full-width-responsive="true" />
    </div>
  );
}
