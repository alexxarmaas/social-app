"use client";

import { Fragment, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import TramasssoIcon from "@/components/ui/TramasssoIcon";
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
      <div className="trm-surface mt-9 grid min-w-0 gap-4 p-5 sm:grid-cols-3 sm:p-6">
        <label className="grid min-w-0 gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          Dificultad
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
            className="w-full min-w-0 rounded-xl border border-white/15 bg-black/50 px-3 py-3 text-sm text-white outline-none focus:border-orange-500">
            <option value="todas">Todas</option><option value="facil">Fácil</option>
            <option value="media">Media</option><option value="exigente">Exigente</option>
          </select>
        </label>
        <label className="grid min-w-0 gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          Tipo de ruta
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="w-full min-w-0 rounded-xl border border-white/15 bg-black/50 px-3 py-3 text-sm text-white outline-none focus:border-orange-500">
            <option value="todos">Todos</option><option value="carretera">Carretera</option>
            <option value="costa">Costa</option><option value="montana">Montaña</option>
            <option value="nocturna">Nocturna</option><option value="exposicion">Exposición</option>
          </select>
        </label>
        <label className="grid min-w-0 gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          Distancia máxima
          <select value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)}
            className="w-full min-w-0 rounded-xl border border-white/15 bg-black/50 px-3 py-3 text-sm text-white outline-none focus:border-orange-500">
            <option value="todas">Todas</option><option value="50">Hasta 50 km</option>
            <option value="100">Hasta 100 km</option><option value="200">Hasta 200 km</option>
          </select>
        </label>
      </div>
      <div className="mt-9 flex items-center justify-between gap-4">
        <p className="trm-kicker">Rutas disponibles</p>
        <span className="text-xs text-zinc-500">{filtered.length} rutas</span>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((route, index) => (
          <Fragment key={route.id}>
            <article className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#101113] transition-colors hover:border-orange-500/50">
              <div className="relative aspect-[16/10] overflow-hidden bg-[#171719]">
                {route.cover_image_url ? (
                  <Image src={route.cover_image_url} alt={route.title} fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width: 1280px) 100vw, 33vw" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[radial-gradient(circle,rgba(255,106,0,.11),transparent_65%)]">
                    <TramasssoIcon name="routes" size="lg" />
                  </div>
                )}
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="trm-pill border-white/10 bg-black/80">{route.difficulty}</span>
                  <span className="trm-pill border-white/10 bg-black/80">{route.route_type}</span>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="trm-kicker">{route.start_point}</p>
                <h2 className="trm-card-title mt-3 text-[1.45rem] leading-tight">{route.title}</h2>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-zinc-400">{route.description}</p>
                <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-2">
                    <TramasssoIcon name="routes" frame={false} size="sm" className="text-orange-400" />{route.distance_km} km
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <TramasssoIcon name="activity" frame={false} size="sm" />{route.drive_time_minutes} min
                  </span>
                </div>
                <Link href={"/routes/" + route.id} className="trm-action-secondary mt-6 w-fit">
                  Ver ruta <TramasssoIcon name="arrow" frame={false} size="sm" />
                </Link>
              </div>
            </article>
            {(index + 1) % 4 === 0 ? <AdBanner slot={adSlot} className="md:col-span-2 xl:col-span-3" /> : null}
          </Fragment>
        ))}
      </div>
      {!filtered.length ? (
        <div className="trm-surface mt-6 flex flex-col items-center p-10 text-center">
          <TramasssoIcon name="routes" size="lg" />
          <p className="mt-5 text-sm text-zinc-400">No hay rutas que coincidan con esos filtros.</p>
        </div>
      ) : null}
    </>
  );
}
