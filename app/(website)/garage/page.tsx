import type { Metadata } from "next";
import Link from "next/link";
import TramasssoIcon from "@/components/ui/TramasssoIcon";
import CarCard from "@/components/garage/CarCard";
import SponsorSpotlight from "@/components/ads/SponsorSpotlight";
import { latestPublicCars, searchPublicCars } from "@/app/lib/community-data";
import { buildPremiumMetadata } from "@/app/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPremiumMetadata({
  title: "Garage: coches de la comunidad",
  description: "Explora proyectos reales de la comunidad Tramassso. Descubre coches, modificaciones e historias y comparte tu propio garaje.",
  path: "/garage",
});

export default async function GaragePage({ searchParams }: { searchParams: Promise<{ q?: string; make?: string; from?: string; to?: string }> }) {
  const filters = await searchParams;
  const q = typeof filters.q === "string" ? filters.q.slice(0, 60) : "";
  const make = typeof filters.make === "string" ? filters.make.slice(0, 50) : "";
  const from = filters.from ? Number(filters.from) : undefined;
  const to = filters.to ? Number(filters.to) : undefined;
  const searching = Boolean(q || make || from || to);
  const cars = searching
    ? await searchPublicCars({ q, make, minYear: from, maxYear: to })
    : await latestPublicCars(24);
  return (
    <main className="min-h-screen bg-[#08090a] px-4 pb-20 pt-12 text-white sm:pt-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-7">
          <div className="max-w-3xl">
            <span className="trm-pill"><TramasssoIcon name="garage" frame={false} size="sm" /> Comunidad / Garage</span>
            <h1 className="mt-5 text-balance font-sans text-[clamp(2.6rem,5.6vw,4.6rem)] font-black uppercase leading-[1.04] tracking-[-0.05em]">
              Cada coche tiene una historia.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
              Descubre proyectos reales, fotos y modificaciones de la comunidad. O comparte el tuyo, sin importar la marca.
            </p>
          </div>
          <Link href="/garage/new" className="trm-action">
            <TramasssoIcon name="plus" frame={false} size="sm" /> Añadir mi coche
          </Link>
        </div>

        <form action="/garage" method="get"
          className="trm-surface mt-10 grid min-w-0 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_105px_105px_auto] xl:items-end">
          <label className="min-w-0 text-xs font-bold uppercase tracking-wider text-zinc-400">
            Buscar coche
            <input name="q" defaultValue={q} maxLength={60} placeholder="Golf, Prelude, E30..."
              className="mt-2 w-full min-w-0 rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-base text-white outline-none focus:border-orange-500" />
          </label>
          <label className="min-w-0 text-xs font-bold uppercase tracking-wider text-zinc-400">
            Marca
            <input name="make" defaultValue={make} maxLength={50} placeholder="Volkswagen"
              className="mt-2 w-full min-w-0 rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-base text-white outline-none focus:border-orange-500" />
          </label>
          <label className="min-w-0 text-xs font-bold uppercase tracking-wider text-zinc-400">
            Desde
            <input name="from" defaultValue={filters.from || ""} type="number" min={1900} max={2030} placeholder="1990"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/50 px-3 py-3 text-base text-white outline-none focus:border-orange-500" />
          </label>
          <label className="min-w-0 text-xs font-bold uppercase tracking-wider text-zinc-400">
            Hasta
            <input name="to" defaultValue={filters.to || ""} type="number" min={1900} max={2030} placeholder="2026"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/50 px-3 py-3 text-base text-white outline-none focus:border-orange-500" />
          </label>
          <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-1">
            <button type="submit" className="trm-action flex-1 xl:flex-none">
              <TramasssoIcon name="search" size="sm" frame={false} /> Buscar
            </button>
            {searching ? <Link href="/garage" className="trm-action-secondary">Limpiar</Link> : null}
          </div>
        </form>

        <div className="mt-10 flex items-center justify-between gap-4">
          <p className="trm-kicker">{searching ? cars.length + " resultados encontrados" : "Últimos proyectos"}</p>
          <span className="text-xs text-zinc-500">Coches de la comunidad</span>
        </div>
        {cars.length ? (
          <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {cars.map((car) => <CarCard key={car.id} car={car} />)}
          </div>
        ) : (
          <div className="trm-surface mt-6 flex flex-col items-center px-6 py-16 text-center">
            <TramasssoIcon name="garage" size="lg" />
            <h2 className="mt-6 font-sans text-2xl font-black uppercase tracking-tight">
              {searching ? "No hay coches con esos filtros." : "Hay sitio para el primer proyecto."}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-zinc-400">
              {searching ? "Prueba con otra marca, modelo o año." : "La comunidad empieza contigo. Publica tu coche y comparte su historia."}
            </p>
            <Link href={searching ? "/garage" : "/garage/new"} className="trm-action mt-7">
              {searching ? "Ver todos los coches" : "Publicar mi coche"}
              <TramasssoIcon name="arrow" size="sm" frame={false} />
            </Link>
          </div>
        )}
        <SponsorSpotlight placement="garage" />
      </div>
    </main>
  );
}
