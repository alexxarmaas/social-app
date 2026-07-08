import Link from "next/link";
import { MdEmail, MdInsights, MdLocationOn, MdOutlineHandshake, MdSpeed, MdStraighten } from "react-icons/md";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.5em] text-zinc-500">Tramassso GC</p>
            <h1 className="text-sm font-semibold uppercase tracking-[0.4em] text-white">Driving Culture, Elevated</h1>
          </div>
          <nav className="hidden items-center gap-8 text-xs uppercase tracking-[0.3em] text-zinc-400 md:flex">
            <Link href="/events" className="transition hover:text-white">Events</Link>
            <Link href="/routes" className="transition hover:text-white">Routes</Link>
            <Link href="/admin" className="transition hover:text-white">Admin</Link>
            <Link href="#contact" className="transition hover:text-white">Contact</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-20">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.5em] text-zinc-500">Gran Canaria</p>
            <h2 className="max-w-3xl text-5xl font-black uppercase tracking-[0.08em] text-white md:text-7xl">
              Premium sports car events and routes with sponsor-grade presentation.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
              Tramassso is being rebuilt as a luxury monochrome platform for curated driving experiences, high-value brand partnerships, and monetized route discovery across GC.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <MdInsights className="text-zinc-300" size={22} />
              <p className="mt-4 text-3xl font-black text-white">1.2M</p>
              <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Monthly impressions</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <MdLocationOn className="text-zinc-300" size={22} />
              <p className="mt-4 text-3xl font-black text-white">GC</p>
              <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Local reach</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <MdSpeed className="text-zinc-300" size={22} />
              <p className="mt-4 text-3xl font-black text-white">Freemium</p>
              <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Model</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/events" className="rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-black transition hover:bg-zinc-200">
              View Events
            </Link>
            <Link href="/routes" className="rounded-full border border-white/15 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-zinc-200 transition hover:border-white hover:text-white">
              Explore Routes
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/70 p-3 shadow-[0_35px_100px_rgba(0,0,0,0.6)]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] border border-white/5 bg-black">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover opacity-70 grayscale"
              poster="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop"
            >
              <source src="https://assets.mixkit.co/videos/preview/mixkit-black-sports-car-driving-on-a-scenic-road-39854-large.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_45%)]" />

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-black/60 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.4em] text-zinc-500">
                  <span>GC sponsor deck</span>
                  <span>2026</span>
                </div>
                <div className="grid gap-2 text-sm text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span>Brand visibility</span>
                    <span className="text-white">High</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Audience fit</span>
                    <span className="text-white">Premium</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Booking path</span>
                    <span className="text-white">Direct</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-14 lg:grid-cols-3 lg:px-8">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <MdOutlineHandshake size={22} className="text-zinc-300" />
          <h3 className="mt-4 text-2xl font-semibold uppercase tracking-[0.16em] text-white">Sponsor-first design</h3>
          <p className="mt-3 text-sm leading-7 text-zinc-400">High-visibility placements, curated inventory, and a clean presentation layer tailored for automotive partners.</p>
        </article>
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <MdStraighten size={22} className="text-zinc-300" />
          <h3 className="mt-4 text-2xl font-semibold uppercase tracking-[0.16em] text-white">Routes that convert</h3>
          <p className="mt-3 text-sm leading-7 text-zinc-400">Drive discovery around Gran Canaria with a route guide built to surface premium content and local relevance.</p>
        </article>
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <MdSpeed size={22} className="text-zinc-300" />
          <h3 className="mt-4 text-2xl font-semibold uppercase tracking-[0.16em] text-white">Fast booking funnel</h3>
          <p className="mt-3 text-sm leading-7 text-zinc-400">Minimal friction inquiry flow for event partnerships, route sponsorships, and branded activations.</p>
        </article>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="grid gap-8 rounded-[2.2rem] border border-white/10 bg-zinc-900/60 p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Sponsor inquiry</p>
            <h3 className="text-4xl font-black uppercase tracking-[0.08em] text-white">Partnership intake</h3>
            <p className="max-w-lg text-sm leading-7 text-zinc-400">Send your brand brief, event activation goals, or route sponsorship ask. The structure is intentionally minimal so the message stays on the offer, not the UI.</p>
          </div>

          <form className="grid gap-4 rounded-[1.6rem] border border-white/10 bg-black/40 p-5" action="mailto:partnerships@tramassso.com" method="post" encType="text/plain">
            <div className="grid gap-4 md:grid-cols-2">
              <input name="name" placeholder="Name" className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30" />
              <input name="email" placeholder="Email" type="email" className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30" />
            </div>
            <input name="brand" placeholder="Brand / agency" className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30" />
            <textarea name="brief" rows={5} placeholder="Tell us what you want to activate." className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30" />
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Direct sponsor contact</p>
              <button type="submit" className="rounded-full bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-black transition hover:bg-zinc-200">
                <MdEmail className="inline-block align-[-2px]" />
                <span className="ml-2">Send inquiry</span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
