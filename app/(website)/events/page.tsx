import type { Metadata } from "next";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import AdBanner from "@/components/ads/AdBanner";
import { listPublicEvents } from "@/app/lib/tramassso-content";
import { buildPremiumMetadata } from "@/app/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPremiumMetadata({
  title: "Tramassso Events Feed",
  description: "Official sports car events in Gran Canaria with curated editorial layout and sponsor-ready placements.",
  path: "/events",
  image: null,
});

export default async function EventsFeedPage() {
  const { events, error } = await listPublicEvents();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Events feed</p>
          <h1 className="text-4xl font-black uppercase tracking-[0.12em] text-white md:text-6xl">Official Tramassso events</h1>
          <p className="max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">Curated sports car gatherings in Gran Canaria with clean ad inventory placed between the editorial cards.</p>
        </div>

        {error ? <p className="mt-8 text-sm text-red-300">{error}</p> : null}

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event, index) => (
            <Fragment key={event.id}>
              <article key={event.id} className="group overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950/80">
                <div className="relative aspect-[16/11] overflow-hidden bg-zinc-900">
                  {event.cover_image_url ? (
                    <Image src={event.cover_image_url} alt={event.title} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 1280px) 100vw, 33vw" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.4em] text-zinc-600">No cover</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-400">{new Date(event.date).toLocaleDateString("en-GB")}</p>
                    <h2 className="mt-2 text-2xl font-semibold uppercase tracking-[0.08em] text-white">{event.title}</h2>
                  </div>
                </div>
                <div className="space-y-4 p-5 text-sm text-zinc-400">
                  <p className="leading-7">{event.description}</p>
                  <div className="flex items-center justify-between gap-3 border-t border-zinc-800 pt-4 text-[10px] uppercase tracking-[0.35em] text-zinc-500">
                    <span>{event.location}</span>
                    <span>{event.gallery_urls.length} media</span>
                  </div>
                </div>
              </article>

              {(index + 1) % 3 === 0 ? (
                <AdBanner
                  key={`ad-${event.id}`}
                  slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_EVENTS_1 ?? "0000000000"}
                  label="Sponsored in-feed slot"
                  className="md:col-span-2 xl:col-span-3"
                />
              ) : null}
            </Fragment>
          ))}
        </div>

        {!events.length ? (
          <div className="mt-10 rounded-[2rem] border border-dashed border-zinc-800 bg-white/5 p-10 text-center">
            <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">No events published yet</p>
            <p className="mt-3 text-sm text-zinc-400">Use the admin panel to publish the first Tramassso event.</p>
            <Link href="/admin" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-black transition hover:bg-zinc-200">
              Open Admin
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}