import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicRouteById } from "@/app/lib/tramassso-content";
import { buildPremiumMetadata, luxuryFallbackImage, luxuryFallbackPath, metadataBase } from "@/app/lib/seo";
import RouteMap from "@/components/routes/RouteMap";

export const dynamic = "force-dynamic";

type RoutePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { id } = await params;
  const { route } = await getPublicRouteById(id);

  if (!route) {
    return buildPremiumMetadata({
      title: "Ruta Tramassso",
      description: "Ruta premium de conducción en Gran Canaria.",
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-5 sm:py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 sm:tracking-[0.45em]">Detalle de la ruta</p>
            <h1 className="text-balance text-4xl font-black uppercase tracking-[0.05em] text-white sm:text-5xl sm:tracking-[0.08em] md:text-7xl">{route.title}</h1>
            <p className="max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">{route.description}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="min-w-0 rounded-2xl border border-zinc-800 bg-white/5 p-4 sm:rounded-3xl">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 sm:tracking-[0.35em]">Salida</p>
                <p className="mt-2 break-words text-white">{route.start_point}</p>
              </div>
              <div className="min-w-0 rounded-2xl border border-zinc-800 bg-white/5 p-4 sm:rounded-3xl">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 sm:tracking-[0.35em]">Llegada</p>
                <p className="mt-2 break-words text-white">{route.end_point}</p>
              </div>
              <div className="min-w-0 rounded-2xl border border-zinc-800 bg-white/5 p-4 sm:rounded-3xl">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 sm:tracking-[0.35em]">Distancia</p>
                <p className="mt-2 text-white">{route.distance_km} km</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-zinc-900/80 sm:rounded-[2rem]">
            <div className="relative aspect-[4/5]">
              <Image src={route.cover_image_url || luxuryFallbackPath} alt={route.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 45vw" />
            </div>
            <div className="grid gap-3 border-t border-zinc-800 p-4 text-sm text-zinc-400 sm:p-5">
              {route.gallery_urls.length > 0 ? route.gallery_urls.slice(0, 3).map((imageUrl) => (
                <div key={imageUrl} className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-800">
                  <Image src={imageUrl} alt={route.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 20vw" />
                </div>
              )) : <p>Aún no hay imágenes en la galería.</p>}
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 sm:tracking-[0.45em]">Mapa interactivo</p>
            <h2 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-white">Trazado de la ruta</h2>
          </div>
          <RouteMap coordinates={route.coordinates} />
        </div>
      </section>
    </main>
  );
}
