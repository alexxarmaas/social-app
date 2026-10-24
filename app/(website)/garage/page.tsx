import type { Metadata } from "next";
import Link from "next/link";
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
    <main className="min-h-screen bg-zinc-950 px-4 py-12 text-white sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-orange-500">La comunidad / Garage</p>
            <h1 className="mt-4 text-5xl font-black uppercase tracking-[0.05em] sm:text-7xl">Cada coche tiene una historia.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">Proyectos reales. Modificaciones, recuerdos y mucho motor. Descubre los garajes de la comunidad o presenta el tuyo.</p>
          </div>
          <Link href="/garage/new" className="rounded-xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-black transition hover:bg-orange-400">+ Añadir mi coche</Link>
        </div>
        <form action="/garage" method="get" className="mt-10 grid gap-3 rounded-2xl border border-white/10 bg-zinc-900/50 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)_100px_100px_auto] sm:items-end">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Buscar coche
            <input name="q" defaultValue={q} maxLength={60} placeholder="Golf, Prelude, E30..." className="mt-2 w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-orange-500" />
          </label>
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Marca
            <input name="make" defaultValue={make} maxLength={50} placeholder="Volkswagen" className="mt-2 w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-orange-500" />
          </label>
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Desde
            <input name="from" defaultValue={filters.from || ""} type="number" min={1900} max={2030} placeholder="1990" className="mt-2 w-full rounded-xl border border-white/15 bg-black px-3 py-3 text-base text-white" />
          </label>
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Hasta
            <input name="to" defaultValue={filters.to || ""} type="number" min={1900} max={2030} placeholder="2026" className="mt-2 w-full rounded-xl border border-white/15 bg-black px-3 py-3 text-base text-white" />
          </label>
          <div className="flex gap-2">
            <button className="rounded-xl bg-orange-500 px-5 py-3 text-xs font-black uppercase text-black">Buscar</button>
            {searching ? <Link href="/garage" className="rounded-xl border border-white/15 px-4 py-3 text-xs uppercase text-zinc-300">Limpiar</Link> : null}
          </div>
        </form>
        {searching ? <p role="status" className="mt-4 text-xs uppercase tracking-wider text-zinc-500">{cars.length} resultados</p> : null}
        {cars.length ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {cars.map((car) => <CarCard key={car.id} car={car} />)}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black px-6 py-20 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">Un garaje por estrenar</p>
            <h2 className="mt-5 text-3xl font-black uppercase">Se el primero en dejar huella.</h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-zinc-400">No encontramos coches con esos filtros o todavia no hay vehiculos publicados. Prueba con otra busqueda o crea tu primera ficha.</p>
            <Link href="/garage/new" className="mt-7 inline-flex rounded-xl border border-orange-500 px-6 py-3 text-xs font-bold uppercase tracking-widest text-orange-500">Publicar mi coche</Link>
          </div>
        )}
        <SponsorSpotlight placement="garage" />
      </div>
    </main>
  );
}
