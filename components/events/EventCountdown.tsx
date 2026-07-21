"use client";

import { useEffect, useState } from "react";

function parts(milliseconds: number) {
  const total = Math.max(0, Math.floor(milliseconds / 1000));
  return { days: Math.floor(total / 86400), hours: Math.floor((total % 86400) / 3600), minutes: Math.floor((total % 3600) / 60) };
}

export default function EventCountdown({ date, compact = false }: { date: string; compact?: boolean }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(Date.parse(date) - Date.now());
    const initial = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, 60_000);
    return () => { window.clearTimeout(initial); window.clearInterval(interval); };
  }, [date]);

  if (remaining === null) return <div className="h-8" aria-hidden="true" />;
  if (remaining <= 0) return <span className="inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-red-100">En marcha o finalizado</span>;
  const value = parts(remaining);

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "mt-4" : "mt-6"}`} aria-label={`Faltan ${value.days} dias, ${value.hours} horas y ${value.minutes} minutos`}>
      {[[value.days, "dias"], [value.hours, "horas"], [value.minutes, "min"]].map(([amount, label]) => (
        <span key={String(label)} className="rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white"><strong>{amount}</strong> <span className="text-zinc-500">{label}</span></span>
      ))}
    </div>
  );
}
