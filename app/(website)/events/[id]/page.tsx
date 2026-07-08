import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicEventById } from "@/app/lib/tramassso-content";
import { buildPremiumMetadata, luxuryFallbackImage, luxuryFallbackPath } from "@/app/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { event } = await getPublicEventById(params.id);

  if (!event) {
    return buildPremiumMetadata({
      title: "Tramassso Event",
      description: "Premium Gran Canaria sports car event.",
      path: `/events/${params.id}`,
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

export default async function EventDetailsPage({ params }: { params: { id: string } }) {
  const { event } = await getPublicEventById(params.id);

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">Event detail</p>
            <h1 className="text-5xl font-black uppercase tracking-[0.08em] text-white md:text-7xl">{event.title}</h1>
            <p className="max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">{event.description}</p>
            <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.35em] text-zinc-500">
              <span className="rounded-full border border-zinc-800 bg-white/5 px-4 py-2 text-zinc-300">{new Date(event.date).toLocaleString("en-GB")}</span>
              <span className="rounded-full border border-zinc-800 bg-white/5 px-4 py-2 text-zinc-300">{event.location}</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/80">
            <div className="relative aspect-[4/5]">
              <Image
                src={event.cover_image_url || luxuryFallbackPath}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
            <div className="grid gap-3 border-t border-zinc-800 p-5 text-sm text-zinc-400">
              {event.gallery_urls.length > 0 ? event.gallery_urls.slice(0, 3).map((imageUrl) => (
                <div key={imageUrl} className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-800">
                  <Image src={imageUrl} alt={event.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 20vw" />
                </div>
              )) : <p>No gallery media yet.</p>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}