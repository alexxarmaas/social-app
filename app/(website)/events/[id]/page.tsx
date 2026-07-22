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
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="overflow-hidden rounded-[1.25rem] border border-zinc-800/80 bg-zinc-900/80 shadow-2xl shadow-black/20">
          <div className="relative aspect-[4/3] w-full sm:aspect-[16/11] lg:aspect-[16/10]">
            <Image
              src={event.cover_image_url || luxuryFallbackPath}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 80vw"
            />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[9px] uppercase tracking-[0.42em] text-zinc-500">Event detail</p>
          <h1 className="max-w-4xl text-2xl font-black uppercase tracking-[0.05em] text-white sm:text-3xl lg:text-4xl">{event.title}</h1>
          <p className="max-w-3xl text-[13px] leading-6 text-zinc-400 sm:text-sm">{event.description}</p>
          <div className="flex flex-wrap gap-2 text-[9px] uppercase tracking-[0.28em] text-zinc-500 sm:gap-3 sm:text-[10px]">
            <span className="rounded-full border border-zinc-800 bg-white/5 px-3 py-2 text-zinc-300 sm:px-4">{new Date(event.date).toLocaleString("en-GB")}</span>
            <span className="rounded-full border border-zinc-800 bg-white/5 px-3 py-2 text-zinc-300 sm:px-4">{event.location}</span>
          </div>
        </div>

        <div className="grid gap-3 border-t border-zinc-800/80 pt-4 text-sm text-zinc-400 sm:grid-cols-3">
          {event.gallery_urls.length > 0 ? event.gallery_urls.slice(0, 3).map((imageUrl) => (
            <div key={imageUrl} className="relative aspect-video overflow-hidden rounded-xl border border-zinc-800">
              <Image src={imageUrl} alt={event.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 20vw" />
            </div>
          )) : <p>No gallery media yet.</p>}
        </div>
      </section>
    </main>
  );
}
