import type { Metadata } from "next";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import AdBanner from "@/components/ads/AdBanner";
import { listPublicRoutes } from "@/app/lib/tramassso-content";
import { buildPremiumMetadata } from "@/app/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPremiumMetadata({
  title: "Guía de rutas Tramassso",
  description: "Rutas premium por Gran Canaria con una presentación editorial minimalista.",
  path: "/routes",
  image: null,
});

export default async function RoutesGuidePage() {
  const { routes, error } = await listPublicRoutes();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Guía de rutas</p>
          <h1 className="text-4xl font-black uppercase tracking-[0.12em] text-white md:text-6xl">Rutas de conducción por Gran Canaria</h1>
          <p className="max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">Una guía premium para rutas escénicas y experiencias preparadas para marcas, sin interrumpir el contenido.</p>
        </div>

        {error ? <p className="mt-8 text-sm text-red-300">{error}</p> : null}

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {routes.map((route, index) => (
            <Fragment key={route.id}>
              <article className="group overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950/80">
                <div className="relative aspect-[16/11] overflow-hidden bg-zinc-900">
                  {route.cover_image_url ? (
                    <Image src={route.cover_image_url} alt={route.title} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 1280px) 100vw, 33vw" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.4em] text-zinc-600">Sin portada</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-400">{route.start_point}</p>
                    <h2 className="mt-2 text-2xl font-semibold uppercase tracking-[0.08em] text-white">{route.title}</h2>
                  </div>
                </div>
                <div className="space-y-4 p-5 text-sm text-zinc-400">
                  <p className="leading-7">{route.description}</p>
                  <div className="grid grid-cols-2 gap-3 border-t border-zinc-800 pt-4 text-[10px] uppercase tracking-[0.35em] text-zinc-500">
                    <span>{route.distance_km} km</span>
                    <span>{route.drive_time_minutes} min</span>
                    <span>{route.end_point}</span>
                    <span>{route.gallery_urls.length} imágenes</span>
                  </div>
                  <Link href={`/routes/${route.id}`} className="inline-flex rounded-full border border-zinc-800 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-zinc-300 transition hover:border-white hover:text-white">
                    Ver detalle
                  </Link>
                </div>
              </article>

              {(index + 1) % 4 === 0 ? (
                <AdBanner key={`route-ad-${route.id}`} slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ROUTES_1 ?? "0000000000"} label="Espacio patrocinado" className="md:col-span-2 xl:col-span-3" />
              ) : null}
            </Fragment>
          ))}
        </div>

        {!routes.length ? (
          <div className="mt-10 rounded-[2rem] border border-dashed border-zinc-800 bg-white/5 p-10 text-center">
            <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Aún no hay rutas publicadas</p>
            <p className="mt-3 text-sm text-zinc-400">Estamos preparando nuevas rutas escénicas para Gran Canaria.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
