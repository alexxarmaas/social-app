import type { Metadata } from "next";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import TramasssoIcon from "@/components/ui/TramasssoIcon";
import AdBanner from "@/components/ads/AdBanner";
import { getAdsenseSlot, TRAMASSSO_ADSENSE_SLOTS } from "@/app/lib/adsense";
import { listPastEvents, listPublicEvents } from "@/app/lib/tramassso-content";
import { buildPremiumMetadata } from "@/app/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = buildPremiumMetadata({
  title: "Eventos Tramassso",
  description: "Eventos de motor en Gran Canaria con estetica Tramassso.",
  path: "/events",
  image: null,
});

export default async function EventsFeedPage() {
  const [{ events, error }, { events: pastEvents }] = await Promise.all([listPublicEvents(), listPastEvents()]);
  const adSlot = getAdsenseSlot(process.env.NEXT_PUBLIC_ADSENSE_SLOT_EVENTS_1, TRAMASSSO_ADSENSE_SLOTS.events);

  return (
    <main className="min-h-screen bg-[#08090a] text-white">
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-5 sm:pt-16 lg:px-8">
        <span className="trm-pill"><TramasssoIcon name="events" frame={false} size="sm" /> Tramassso / Eventos</span>
        <h1 className="mt-5 font-sans text-[clamp(2.7rem,5.7vw,4.8rem)] font-black uppercase leading-[1.04] tracking-[-0.05em]">Eventos con carácter.</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
          Quedadas, salidas y encuentros de motor. Nos vemos fuera de la pantalla.
        </p>
        {error ? <p role="alert" className="mt-8 text-sm text-red-300">No hemos podido cargar los eventos.</p> : null}
        <div className="mt-11 flex items-center justify-between gap-4">
          <p className="trm-kicker">Próximos eventos</p>
          <span className="text-xs text-zinc-500">{events.length} programados</span>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event, index) => (
            <Fragment key={event.id}>
              <article className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#101113] transition-colors hover:border-orange-500/50">
                <div className="relative aspect-[16/10] overflow-hidden bg-[#171719]">
                  {event.cover_image_url ? (
                    <Image src={event.cover_image_url} alt={event.title} fill
                      sizes="(max-width: 1280px) 100vw, 33vw" priority={index === 0}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle,rgba(255,106,0,.11),transparent_65%)]">
                      <TramasssoIcon name="events" size="lg" />
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <span className="trm-pill border-white/10 bg-black/80">
                      {new Date(event.date).toLocaleDateString("es-ES", {
                        timeZone: "Atlantic/Canary", day: "2-digit", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="trm-card-title text-[1.45rem] leading-tight">{event.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-zinc-400">{event.description}</p>
                  <div className="mt-auto flex flex-wrap gap-4 border-t border-white/10 pt-5 text-xs text-zinc-500">
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <TramasssoIcon name="location" frame={false} size="sm" className="text-orange-400" />
                      <span className="line-clamp-2">{event.location}</span>
                    </span>
                    {event.gallery_urls.length ? <span className="inline-flex items-center gap-2">
                      <TramasssoIcon name="camera" size="sm" frame={false} />
                      {event.gallery_urls.length} fotos
                    </span> : null}
                  </div>
                  <Link href={"/events/" + event.id} className="trm-action-secondary mt-6 w-fit">
                    Ver evento <TramasssoIcon name="arrow" frame={false} size="sm" />
                  </Link>
                </div>
              </article>
              {(index + 1) % 3 === 0 ? (
                <AdBanner key={"ad-" + event.id} slot={adSlot} label="Espacio patrocinado"
                  className="md:col-span-2 xl:col-span-3" />
              ) : null}
            </Fragment>
          ))}
        </div>
        {!events.length ? (
          <div className="trm-surface mt-6 flex flex-col items-center p-10 text-center">
            <TramasssoIcon name="events" size="lg" />
            <h2 className="mt-5 font-sans text-2xl font-black uppercase">La próxima quedada está en camino.</h2>
            <p className="mt-3 text-sm text-zinc-400">Vuelve pronto para ver los próximos encuentros.</p>
          </div>
        ) : null}

        {pastEvents.length ? (
          <section className="mt-16 border-t border-white/10 pt-10">
            <p className="trm-kicker">Archivo / Comunidad</p>
            <h2 className="mt-3 font-sans text-3xl font-black uppercase tracking-tight">Eventos realizados</h2>
            <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event) => (
                <Link key={event.id} href={"/events/" + event.id}
                  className="group flex min-w-0 flex-col rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition-colors hover:border-orange-500/40">
                  <span className="inline-flex items-center gap-2 text-xs text-zinc-500">
                    <TramasssoIcon name="events" size="sm" frame={false} className="text-orange-400" />
                    {new Date(event.date).toLocaleDateString("es-ES", { timeZone: "Atlantic/Canary" })}
                  </span>
                  <h3 className="trm-card-title mt-4 text-xl">{event.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">{event.location}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-5 text-xs font-bold uppercase tracking-wider text-orange-400">
                    Ver recuerdos <TramasssoIcon name="arrow" size="sm" frame={false} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
