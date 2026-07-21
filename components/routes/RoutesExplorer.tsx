"use client";

import { Fragment, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { RouteRecord } from "@/app/lib/tramassso-content";
import AdBanner from "@/components/ads/AdBanner";

export default function RoutesExplorer({ routes, adSlot }: { routes: RouteRecord[]; adSlot: string }) {
  const [difficulty, setDifficulty] = useState("todas");
  const [type, setType] = useState("todos");
  const [maxDistance, setMaxDistance] = useState("todas");
  const filtered = useMemo(() => routes.filter((route) =>
    (difficulty === "todas" || route.difficulty === difficulty) &&
    (type === "todos" || route.route_type === type) &&
    (maxDistance === "todas" || route.distance_km <= Number(maxDistance))
  ), [routes, difficulty, type, maxDistance]);

  return (
    <>
      <div className="mt-8 grid gap-3 rounded-3xl border border-zinc-800 bg-black/30 p-4 sm:grid-cols-3">
        <label className="grid gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">Dificultad<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-white"><option value="todas">Todas</option><option value="facil">Fácil</option><option value="media">Media</option><option value="exigente">Exigente</option></select></label>
        <label className="grid gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">Tipo<select value={type} onChange={(event) => setType(event.target.value)} className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-white"><option value="todos">Todos</option><option value="carretera">Carretera</option><option value="costa">Costa</option><option value="montana">Montaña</option><option value="nocturna">Nocturna</option><option value="exposicion">Exposición</option></select></label>
        <label className="grid gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">Distancia<select value={maxDistance} onChange={(event) => setMaxDistance(event.target.value)} className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-white"><option value="todas">Todas</option><option value="50">Hasta 50 km</option><option value="100">Hasta 100 km</option><option value="200">Hasta 200 km</option></select></label>
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.25em] text-zinc-600">{filtered.length} rutas</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((route, index) => (
          <Fragment key={route.id}>
            <article className="racing-card group overflow-hidden rounded-[2rem] border">
              <div className="relative aspect-[16/11] overflow-hidden bg-zinc-900">
                {route.cover_image_url ? <Image src={route.cover_image_url} alt={route.title} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 1280px) 100vw, 33vw" /> : <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.4em] text-zinc-600">Sin portada</div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute left-4 top-4 flex gap-2"><span className="rounded-full bg-black/80 px-3 py-1 text-[10px] uppercase text-white">{route.difficulty}</span><span className="rounded-full bg-black/80 px-3 py-1 text-[10px] uppercase text-white">{route.route_type}</span></div>
                <div className="absolute bottom-0 p-5"><p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">{route.start_point}</p><h2 className="mt-2 text-2xl font-semibold uppercase text-white">{route.title}</h2></div>
              </div>
              <div className="space-y-4 p-5"><p className="line-clamp-3 text-sm leading-7 text-zinc-400">{route.description}</p><div className="flex flex-wrap gap-2 text-xs text-zinc-500"><span>{route.distance_km} km</span><span>·</span><span>{route.drive_time_minutes} min</span><span>·</span><span>{route.end_point}</span></div><Link href={`/routes/${route.id}`} className="racing-button inline-flex rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.3em]">Ver ruta</Link></div>
            </article>
            {(index + 1) % 4 === 0 ? <AdBanner slot={adSlot} className="md:col-span-2 xl:col-span-3" /> : null}
          </Fragment>
        ))}
      </div>
      {!filtered.length ? <div className="racing-panel mt-8 rounded-[2rem] p-10 text-center text-zinc-400">No hay rutas que coincidan con esos filtros.</div> : null}
    </>
  );
}
