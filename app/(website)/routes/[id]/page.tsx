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
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="overflow-hidden rounded-[1.25rem] border border-zinc-800/80 bg-zinc-900/80 shadow-2xl shadow-black/20">
          <div className="relative aspect-[4/3] w-full sm:aspect-[16/11] lg:aspect-[16/10]">
            <Image
              src={route.cover_image_url || luxuryFallbackPath}
              alt={route.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 80vw"
            />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[9px] uppercase tracking-[0.42em] text-zinc-500">Route detail</p>
          <h1 className="max-w-4xl text-2xl font-black uppercase tracking-[0.05em] text-white sm:text-3xl lg:text-4xl">{route.title}</h1>
          <p className="max-w-2xl text-[13px] leading-6 text-zinc-400 sm:text-sm">{route.description}</p>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-white/5 p-3 sm:p-4">
              <p className="text-[9px] uppercase tracking-[0.35em] text-zinc-500">Start</p>
              <p className="mt-1 text-sm text-white sm:mt-2">{route.start_point}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-white/5 p-3 sm:p-4">
              <p className="text-[9px] uppercase tracking-[0.35em] text-zinc-500">End</p>
              <p className="mt-1 text-sm text-white sm:mt-2">{route.end_point}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-white/5 p-3 sm:p-4">
              <p className="text-[9px] uppercase tracking-[0.35em] text-zinc-500">Distance</p>
              <p className="mt-1 text-sm text-white sm:mt-2">{route.distance_km} km</p>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-4 sm:pt-5">
            <LightboxGallery images={route.gallery_urls} title={route.title} />
          </div>
        </div>

        <div className="grid gap-3 border-t border-zinc-800/80 pt-4 text-sm text-zinc-400 sm:grid-cols-3">
          {route.gallery_urls.length > 0 ? route.gallery_urls.slice(0, 3).map((imageUrl) => (
            <div key={imageUrl} className="relative aspect-video overflow-hidden rounded-xl border border-zinc-800">
              <Image src={imageUrl} alt={route.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 20vw" />
            </div>
          )) : <p>No gallery media yet.</p>}
        </div>
      </section>
    </main>
  );
}
