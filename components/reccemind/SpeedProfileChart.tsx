"use client";

interface Props {
  speeds: number[];
}

export default function SpeedProfileChart({ speeds }: Props) {
  if (!speeds.length) return null;
  const kmh = speeds.map((speed) => speed * 3.6);
  const max = Math.max(...kmh, 1);
  const points = kmh.map((speed, index) => {
    const x = speeds.length === 1 ? 0 : (index / (speeds.length - 1)) * 100;
    const y = 100 - (speed / max) * 100;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
  const min = Math.round(Math.min(...kmh));
  const maxRounded = Math.round(max);

  return (
    <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Telemetría teórica</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Perfil de velocidad</h2>
        </div>
        <p className="text-xs text-amber-200/70">Experimental · {min}–{maxRounded} km/h</p>
      </div>
      <div className="mt-5 rounded-2xl border border-zinc-800 bg-black/30 p-4">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-56 w-full overflow-visible">
          <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" className="text-zinc-800" strokeWidth="0.4" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" className="text-zinc-800" strokeWidth="0.4" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" className="text-zinc-800" strokeWidth="0.4" />
          <polyline points={points} fill="none" stroke="currentColor" className="text-emerald-400" strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-600">
          <span>Salida</span><span>Distancia →</span><span>Llegada</span>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-600">Estimación geométrica; no usar como instrucción de velocidad o conducción.</p>
    </section>
  );
}
