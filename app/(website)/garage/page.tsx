import type { Metadata } from "next";
import Link from "next/link";
import CarCard from "@/components/garage/CarCard";
import { latestPublicCars } from "@/app/lib/community-data";
import { buildPremiumMetadata } from "@/app/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPremiumMetadata({
  title: "Garage: coches de la comunidad",
  description: "Explora proyectos reales de la comunidad Tramassso. Descubre coches, modificaciones e historias y comparte tu propio garaje.",
  path: "/garage",
});

export default async function GaragePage() {
  const cars = await latestPublicCars(24);
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12 text-white sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-lime-300">La comunidad / Garage</p>
            <h1 className="mt-4 text-5xl font-black uppercase tracking-[0.05em] sm:text-7xl">Cada coche tiene una historia.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">Proyectos reales. Modificaciones, recuerdos y mucho motor. Descubre los garajes de la comunidad o presenta el tuyo.</p>
          </div>
          <Link href="/garage/new" className="rounded-xl bg-lime-300 px-6 py-4 text-xs font-black uppercase tracking-widest text-black transition hover:bg-lime-200">+ Añadir mi coche</Link>
        </div>
        {cars.length ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {cars.map((car) => <CarCard key={car.id} car={car} />)}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black px-6 py-20 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-lime-300">Un garaje por estrenar</p>
            <h2 className="mt-5 text-3xl font-black uppercase">Se el primero en dejar huella.</h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-zinc-400">Todavia no hay coches publicados o el servicio no esta disponible. Puedes crear tu primera ficha gratis.</p>
            <Link href="/garage/new" className="mt-7 inline-flex rounded-xl border border-lime-300 px-6 py-3 text-xs font-bold uppercase tracking-widest text-lime-300">Publicar mi coche</Link>
          </div>
        )}
      </div>
    </main>
  );
}
