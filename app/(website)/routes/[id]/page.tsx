import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicRouteById } from "@/app/lib/tramassso-content";
import { buildPremiumMetadata, luxuryFallbackImage, luxuryFallbackPath } from "@/app/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { route } = await getPublicRouteById(params.id);

  if (!route) {
    return buildPremiumMetadata({
      title: "Tramassso Route",
      description: "Premium Gran Canaria driving route.",
      path: `/routes/${params.id}`,
      image: luxuryFallbackImage,
    });
  }

  return buildPremiumMetadata({
    title: route.title,
    description: `${route.start_point} to ${route.end_point} · ${route.distance_km} km`,
    path: `/routes/${route.id}`,
    image: route.cover_image_url,
    type: "article",
  });
}

export default async function RouteDetailsPage({ params }: { params: { id: string } }) {
  const { route } = await getPublicRouteById(params.id);

  if (!route) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">Route detail</p>
            <h1 className="text-5xl font-black uppercase tracking-[0.08em] text-white md:text-7xl">{route.title}</h1>
            <p className="max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">{route.description}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-zinc-800 bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Start</p>
                <p className="mt-2 text-white">{route.start_point}</p>
              </div>
              <div className="rounded-3xl border border-zinc-800 bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">End</p>
                <p className="mt-2 text-white">{route.end_point}</p>
              </div>
              <div className="rounded-3xl border border-zinc-800 bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Distance</p>
                <p className="mt-2 text-white">{route.distance_km} km</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/80">
            <div className="relative aspect-[4/5]">
              <Image
                src={route.cover_image_url || luxuryFallbackPath}
                alt={route.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
            <div className="grid gap-3 border-t border-zinc-800 p-5 text-sm text-zinc-400">
              {route.gallery_urls.length > 0 ? route.gallery_urls.slice(0, 3).map((imageUrl) => (
                <div key={imageUrl} className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-800">
                  <Image src={imageUrl} alt={route.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 20vw" />
                </div>
              )) : <p>No gallery media yet.</p>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}