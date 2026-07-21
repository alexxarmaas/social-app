import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicEventById } from "@/app/lib/tramassso-content";
import { getEventAvailability } from "@/app/lib/event-registrations";
import { serializeJsonLd } from "@/app/lib/json-ld";
import { buildPremiumMetadata, luxuryFallbackImage, luxuryFallbackPath, metadataBase } from "@/app/lib/seo";
import EventCountdown from "@/components/events/EventCountdown";
import ContentActions from "@/components/content/ContentActions";
import LightboxGallery from "@/components/content/LightboxGallery";
import EventCalendarActions from "@/components/events/EventCalendarActions";
import EventParticipation from "@/components/events/EventParticipation";

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

  const { remaining } = event.participation_mode === "managed"
    ? await getEventAvailability(event.id, event.max_participants)
    : { remaining: null };

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
    ...(event.organizer_name ? {
      organizer: {
        "@type": "Organization",
        name: event.organizer_name,
        ...(event.organizer_name.toLowerCase() === "tramassso" ? { url: metadataBase.toString() } : {}),
      },
    } : {}),
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
            <EventCountdown date={event.date} />
            <ContentActions title={event.title} location={event.location} date={event.date} kind="event" />
            <EventCalendarActions event={event} />
          </div>

          <div className="racing-panel rounded-[1.5rem] sm:rounded-[2rem]">
            <div className="relative aspect-[4/5]">
              <Image src={event.cover_image_url || luxuryFallbackPath} alt={event.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 45vw" priority />
            </div>
            <div className="border-t border-zinc-800 p-4 sm:p-5"><LightboxGallery images={event.gallery_urls} title={event.title} /></div>
          </div>
        </div>

        <div className="mt-10 max-w-3xl">
          <EventParticipation event={event} remaining={remaining} />
        </div>
      </section>
    </main>
  );
}
