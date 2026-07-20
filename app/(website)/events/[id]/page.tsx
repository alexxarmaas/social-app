import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicEventById } from "@/app/lib/tramassso-content";
import { serializeJsonLd } from "@/app/lib/json-ld";
import { buildPremiumMetadata, luxuryFallbackImage, luxuryFallbackPath, metadataBase } from "@/app/lib/seo";

export const revalidate = 60;

type EventPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const { event } = await getPublicEventById(id);

  if (!event) {
    return buildPremiumMetadata({
      title: "Evento Tramassso",
      description: "Evento premium de coches en Gran Canaria.",
      path: `/events/${id}`,
      image: luxuryFallbackImage,
    });
  }

  return buildPremiumMetadata({
    title: event.title,
    description: `${event.location} · ${event.description.slice(0, 140)}`,
    path: `/events/${event.id}`,
    image: event.cover_image_url,
    type: "article",
  });
}

export default async function EventDetailsPage({ params }: EventPageProps) {
  const { id } = await params;
  const { event } = await getPublicEventById(id);

  if (!event) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.date,
    image: event.cover_image_url ? [event.cover_image_url] : [luxuryFallbackImage],
    url: new URL(`/events/${event.id}`, metadataBase).toString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.location,
      address: event.location,
    },
    organizer: {
      "@type": "Organization",
      name: "Tramassso",
      url: metadataBase.toString(),
    },
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-5 sm:py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-6">
            <p className="racing-eyebrow text-[10px] uppercase tracking-[0.3em] text-zinc-500 sm:tracking-[0.45em]">Detalle del evento</p>
            <h1 className="text-balance text-4xl font-black uppercase tracking-[0.05em] text-white sm:text-5xl sm:tracking-[0.08em] md:text-7xl">{event.title}</h1>
            <p className="max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">{event.description}</p>
            <div className="grid gap-3 text-[10px] uppercase tracking-[0.22em] text-zinc-500 sm:flex sm:flex-wrap sm:tracking-[0.35em]">
              <span className="min-w-0 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2 text-zinc-100">{new Date(event.date).toLocaleString("es-ES")}</span>
              <span className="min-w-0 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2 text-zinc-100">{event.location}</span>
            </div>
          </div>

          <div className="racing-panel rounded-[1.5rem] sm:rounded-[2rem]">
            <div className="relative aspect-[4/5]">
              <Image src={event.cover_image_url || luxuryFallbackPath} alt={event.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 45vw" priority />
            </div>
            <div className="grid gap-3 border-t border-zinc-800 p-4 text-sm text-zinc-400 sm:p-5">
              {event.gallery_urls.length > 0 ? event.gallery_urls.slice(0, 3).map((imageUrl) => (
                <div key={imageUrl} className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-800">
                  <Image src={imageUrl} alt={event.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 20vw" />
                </div>
              )) : <p>Aun no hay imagenes en la galeria.</p>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
