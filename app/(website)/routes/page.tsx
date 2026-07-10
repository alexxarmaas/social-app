import type { Metadata } from "next";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import AdBanner from "@/components/ads/AdBanner";
import { listPublicRoutes } from "@/app/lib/tramassso-content";
import { buildPremiumMetadata } from "@/app/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPremiumMetadata({
  title: "Rutas Tramassso",
  description: "Rutas de motor por Gran Canaria con estética Tramassso.",
  path: "/routes",
  image: null,
});

export default async function RoutesGuidePage() {
  const { routes, error } = await listPublicRoutes();

  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-50">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-5 sm:py-14 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <p className="racing-eyebrow text-xs uppercase tracking-[0.45em] text-zinc-500">Rutas</p>
          <h1 className="text-balance text-3xl font-black uppercase tracking-[0.06em] text-white sm:text-4xl sm:tracking-[0.1em] md:text-6xl">Gran Canaria en ruta</h1>
          <p className="max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">Trazados seleccionados para conducir, grabar y disfrutar.</p>
        </div>

        {error ? <p className="mt-8 text-sm text-red-300">No hemos podido cargar las rutas.</p> : null}

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {routes.map((route, index) => (
            <Fragment key={route.id}>
              <article className="racing-card group min-w-0 overflow-hidden rounded-[1.5rem] border sm:rounded-[2rem]">
                <div className="relative aspect-[16/11] overflow-hidden bg-zinc-900">
                  {route.cover_image_url ? (
                    <Image src={route.cover_image_url} alt={route.title} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 1280px) 100vw, 33vw" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.4em] text-zinc-600">Sin portada</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  {route.coordinates && route.coordinates.length >= 2 ? (
                    <span className="absolute right-4 top-4 rounded-full border border-red-500/35 bg-black/75 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white shadow-[0_0_24px_rgba(255,43,31,0.18)] backdrop-blur">
                      Mapa
                    </span>
                  ) : null}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <p className="truncate text-[10px] uppercase tracking-[0.28em] text-zinc-400 sm:tracking-[0.45em]">{route.start_point}</p>
                    <h2 className="mt-2 text-xl font-semibold uppercase tracking-[0.06em] text-white sm:text-2xl sm:tracking-[0.08em]">{route.title}</h2>
                  </div>
                </div>
                <div className="space-y-4 p-4 text-sm text-zinc-400 sm:p-5">
                  <p className="line-clamp-3 leading-7">{route.description}</p>
                  <div className="grid grid-cols-2 gap-3 border-t border-zinc-800 pt-4 text-[10px] uppercase tracking-[0.22em] text-zinc-500 sm:tracking-[0.35em]">
                    <span>{route.distance_km} km</span>
                    <span>{route.drive_time_minutes} min</span>
                    <span>{route.end_point}</span>
                    <span>{route.gallery_urls.length} imágenes</span>
                  </div>
                  <Link href={`/routes/${route.id}`} className="racing-button inline-flex rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.3em] transition">
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
          <div className="racing-panel mt-10 rounded-[2rem] p-10 text-center">
            <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Nuevas rutas pronto</p>
            <p className="mt-3 text-sm text-zinc-400">Estamos preparando nuevos trazados.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
