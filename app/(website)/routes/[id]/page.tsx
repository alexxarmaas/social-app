import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicRouteById } from "@/app/lib/tramassso-content";
import { serializeJsonLd } from "@/app/lib/json-ld";
import { buildPremiumMetadata, luxuryFallbackImage, luxuryFallbackPath, metadataBase } from "@/app/lib/seo";
import RouteMap from "@/components/routes/RouteMap";
import ContentActions from "@/components/content/ContentActions";
import LightboxGallery from "@/components/content/LightboxGallery";

export const revalidate = 60;

type RoutePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { id } = await params;
  const { route } = await getPublicRouteById(id);

  if (!route) {
    return buildPremiumMetadata({
      title: "Ruta Tramassso",
      description: "Ruta premium de conduccion en Gran Canaria.",
      path: `/routes/${id}`,
      image: luxuryFallbackImage,
    });
  }

  return buildPremiumMetadata({
    title: route.title,
    description: `${route.start_point} a ${route.end_point} · ${route.distance_km} km`,
    path: `/routes/${route.id}`,
    image: route.cover_image_url,
    type: "article",
  });
}

export default async function RouteDetailsPage({ params }: RoutePageProps) {
  const { id } = await params;
  const { route } = await getPublicRouteById(id);

  if (!route) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: route.title,
    description: route.description,
    image: route.cover_image_url ?? luxuryFallbackImage,
    url: new URL(`/routes/${route.id}`, metadataBase).toString(),
    itinerary: {
      "@type": "ItemList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: route.start_point,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: route.end_point,
        },
      ],
    },
    provider: {
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
            <p className="racing-eyebrow text-[10px] uppercase tracking-[0.3em] text-zinc-500 sm:tracking-[0.45em]">Detalle de la ruta</p>
            <h1 className="text-balance text-4xl font-black uppercase tracking-[0.05em] text-white sm:text-5xl sm:tracking-[0.08em] md:text-7xl">{route.title}</h1>
            <p className="max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">{route.description}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="racing-card min-w-0 rounded-2xl border p-4 sm:rounded-3xl">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 sm:tracking-[0.35em]">Salida</p>
                <p className="mt-2 break-words text-white">{route.start_point}</p>
              </div>
              <div className="racing-card min-w-0 rounded-2xl border p-4 sm:rounded-3xl">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 sm:tracking-[0.35em]">Llegada</p>
                <p className="mt-2 break-words text-white">{route.end_point}</p>
              </div>
              <div className="racing-card min-w-0 rounded-2xl border p-4 sm:rounded-3xl">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 sm:tracking-[0.35em]">Distancia</p>
                <p className="mt-2 text-white">{route.distance_km} km</p>
              </div>
              <div className="racing-card min-w-0 rounded-2xl border p-4 sm:rounded-3xl">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Dificultad</p>
                <p className="mt-2 capitalize text-white">{route.difficulty}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400"><span className="rounded-full border border-white/10 px-3 py-2 capitalize">{route.route_type}</span>{route.recommended_time ? <span className="rounded-full border border-white/10 px-3 py-2">{route.recommended_time}</span> : null}</div>
            <ContentActions title={route.title} location={route.start_point} kind="route" />
            {route.gpx_filename ? (
              <a href={`/api/routes/${route.id}/gpx`} className="inline-flex rounded-full bg-white px-5 py-3 text-xs font-medium uppercase tracking-[0.24em] text-black transition hover:bg-zinc-200">
                Descargar ruta GPX
              </a>
            ) : null}
          </div>

          <div className="racing-panel rounded-[1.5rem] sm:rounded-[2rem]">
            <div className="relative aspect-[4/5]">
              <Image src={route.cover_image_url || luxuryFallbackPath} alt={route.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 45vw" priority />
            </div>
            <div className="border-t border-zinc-800 p-4 sm:p-5"><LightboxGallery images={route.gallery_urls} title={route.title} /></div>
          </div>
        </div>

        <div className="mt-10 space-y-4">
          <div>
            <p className="racing-eyebrow text-[10px] uppercase tracking-[0.3em] text-zinc-500 sm:tracking-[0.45em]">Mapa interactivo</p>
            <h2 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-white">Trazado de la ruta</h2>
          </div>
          <RouteMap coordinates={route.coordinates} />
        </div>
      </section>
    </main>
  );
}
