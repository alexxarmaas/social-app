import type { Metadata } from "next";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import AdBanner from "@/components/ads/AdBanner";
import { listPublicEvents } from "@/app/lib/tramassso-content";
import { buildPremiumMetadata } from "@/app/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPremiumMetadata({
  title: "Eventos Tramassso",
  description: "Eventos oficiales de coches en Gran Canaria con presentación editorial y espacios preparados para patrocinadores.",
  path: "/events",
  image: null,
});

export default async function EventsFeedPage() {
  const { events, error } = await listPublicEvents();

  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-50">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-5 sm:py-14 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Eventos</p>
          <h1 className="text-balance text-3xl font-black uppercase tracking-[0.06em] text-white sm:text-4xl sm:tracking-[0.1em] md:text-6xl">Eventos oficiales de Tramassso</h1>
          <p className="max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">Quedadas y experiencias de coches en Gran Canaria con inventario publicitario integrado entre las tarjetas.</p>
        </div>

        {error ? <p className="mt-8 text-sm text-red-300">No hemos podido cargar los eventos en este momento.</p> : null}

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event, index) => (
            <Fragment key={event.id}>
              <article className="group min-w-0 overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-zinc-950/80 sm:rounded-[2rem]">
                <div className="relative aspect-[16/11] overflow-hidden bg-zinc-900">
                  {event.cover_image_url ? (
                    <Image src={event.cover_image_url} alt={event.title} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 1280px) 100vw, 33vw" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.4em] text-zinc-600">Sin portada</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-400 sm:tracking-[0.45em]">{new Date(event.date).toLocaleDateString("es-ES")}</p>
                    <h2 className="mt-2 text-xl font-semibold uppercase tracking-[0.06em] text-white sm:text-2xl sm:tracking-[0.08em]">{event.title}</h2>
                  </div>
                </div>
                <div className="space-y-4 p-4 text-sm text-zinc-400 sm:p-5">
                  <p className="leading-7">{event.description}</p>
                  <div className="grid gap-2 border-t border-zinc-800 pt-4 text-[10px] uppercase tracking-[0.22em] text-zinc-500 sm:flex sm:items-center sm:justify-between sm:gap-3 sm:tracking-[0.35em]">
                    <span className="min-w-0 truncate">{event.location}</span>
                    <span>{event.gallery_urls.length} imágenes</span>
                  </div>
                  <Link href={`/events/${event.id}`} className="inline-flex rounded-full border border-zinc-800 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-zinc-300 transition hover:border-white hover:text-white">
                    Ver detalle
                  </Link>
                </div>
              </article>

              {(index + 1) % 3 === 0 ? (
                <AdBanner key={`ad-${event.id}`} slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_EVENTS_1 ?? "0000000000"} label="Espacio patrocinado" className="md:col-span-2 xl:col-span-3" />
              ) : null}
            </Fragment>
          ))}
        </div>

        {!events.length ? (
          <div className="mt-10 rounded-[2rem] border border-dashed border-zinc-800 bg-white/5 p-10 text-center">
            <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Aún no hay eventos publicados</p>
            <p className="mt-3 text-sm text-zinc-400">Pronto publicaremos las próximas quedadas y experiencias de Tramassso.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
