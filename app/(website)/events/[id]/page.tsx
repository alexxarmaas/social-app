import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MdArrowOutward } from "react-icons/md";
import { getPublicEventById } from "@/app/lib/tramassso-content";
import { getEventAvailability } from "@/app/lib/event-registrations";
import { serializeJsonLd } from "@/app/lib/json-ld";
import { buildPremiumMetadata, luxuryFallbackImage, luxuryFallbackPath, metadataBase } from "@/app/lib/seo";
import EventCountdown from "@/components/events/EventCountdown";
import EventCover from "@/components/events/EventCover";
import ContentActions from "@/components/content/ContentActions";
import LightboxGallery from "@/components/content/LightboxGallery";
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

function registrationState(mode: string, remaining: number | null, hasExternalUrl: boolean) {
  if (mode === "external" && hasExternalUrl) {
    return { label: "Inscripciones abiertas", className: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200" };
  }
  if (mode === "managed" && remaining === 0) {
    return { label: "Aforo completo", className: "border-red-400/25 bg-red-400/10 text-red-200" };
  }
  if (mode === "managed") {
    return { label: "Solicitudes abiertas", className: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200" };
  }
  if (mode === "interest") {
    return { label: "Lista de interesados", className: "border-amber-400/25 bg-amber-400/10 text-amber-100" };
  }
  return { label: "Evento informativo", className: "border-zinc-700 bg-white/5 text-zinc-300" };
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

  const status = registrationState(
    event.participation_mode,
    remaining,
    Boolean(event.external_registration_url),
  );
  const eventUrl = new URL(`/events/${event.id}`, metadataBase).toString();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.date,
    image: event.cover_image_url ? [event.cover_image_url] : [luxuryFallbackImage],
    url: eventUrl,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.location,
      address: event.location,
    },
    ...(event.external_registration_url ? {
      offers: {
        "@type": "Offer",
        url: event.external_registration_url,
        availability: "https://schema.org/InStock",
      },
    } : {}),
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
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <EventCover
          src={event.cover_image_url || luxuryFallbackPath}
          alt={`Cartel de ${event.title}`}
          priority
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.38fr)] lg:items-start">
          <div className="min-w-0 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[9px] uppercase tracking-[0.42em] text-zinc-500">Detalles del evento</p>
              <span className={`rounded-full border px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.22em] ${status.className}`}>
                {status.label}
              </span>
            </div>

            <h1 className="max-w-4xl text-balance break-words text-2xl font-black uppercase tracking-[0.05em] text-white sm:text-3xl lg:text-4xl">
              {event.title}
            </h1>

            <p className="max-w-3xl whitespace-pre-line text-[13px] leading-6 text-zinc-400 sm:text-sm sm:leading-7">
              {event.description}
            </p>

            <div className="flex flex-wrap gap-2 text-[9px] uppercase tracking-[0.22em] text-zinc-500 sm:gap-3 sm:text-[10px] sm:tracking-[0.28em]">
              <span className="rounded-full border border-zinc-800 bg-white/5 px-3 py-2 text-zinc-300 sm:px-4">
                {new Date(event.date).toLocaleString("es-ES", {
                  timeZone: "Atlantic/Canary",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="max-w-full break-words rounded-full border border-zinc-800 bg-white/5 px-3 py-2 text-zinc-300 sm:px-4">
                {event.location}
              </span>
              {event.organizer_name ? (
                <span className="rounded-full border border-zinc-800 bg-white/5 px-3 py-2 text-zinc-300 sm:px-4">
                  Organiza: {event.organizer_name}
                </span>
              ) : null}
            </div>

            <EventCountdown date={event.date} compact />
            <ContentActions title={event.title} location={event.location} kind="event" contentId={event.id} />
          </div>

          <aside className="rounded-[1.5rem] border border-zinc-800 bg-black/30 p-4 sm:p-5 lg:sticky lg:top-24">
            <p className="text-[9px] uppercase tracking-[0.35em] text-zinc-500">Participación</p>
            <h2 className="mt-3 text-xl font-black uppercase tracking-[0.04em] text-white">
              {event.participation_mode === "external" ? "Reserva tu plaza" : "Participa en el evento"}
            </h2>

            {event.participation_mode === "external" && event.external_registration_url ? (
              <>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  La inscripción la gestiona {event.organizer_name || "el organizador oficial"}. El enlace se abrirá en una pestaña nueva.
                </p>
                <a
                  href={event.external_registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="racing-button mt-5 inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.24em]"
                >
                  Inscribirme
                  <MdArrowOutward className="ml-2" size={18} aria-hidden="true" />
                </a>
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Consulta el formulario y las condiciones de participación más abajo.
              </p>
            )}
          </aside>
        </div>

        {event.participation_mode !== "external" ? (
          <EventParticipation event={event} remaining={remaining} />
        ) : null}

        {event.gallery_urls.length > 0 ? (
          <section className="border-t border-zinc-800/80 pt-6" aria-labelledby="event-gallery-title">
            <p className="text-[9px] uppercase tracking-[0.4em] text-zinc-500">Galería</p>
            <h2 id="event-gallery-title" className="mt-3 text-xl font-black uppercase tracking-[0.05em] text-white sm:text-2xl">
              Imágenes del evento
            </h2>
            <div className="mt-5">
              <LightboxGallery images={event.gallery_urls} title={event.title} />
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
