import Image from "next/image";
import Link from "next/link";
import { MdArrowOutward, MdCalendarMonth, MdDirectionsCar, MdMap, MdOutlineHandshake } from "react-icons/md";
import { listPublicEvents, listPublicPartners, listPublicRoutes } from "@/app/lib/tramassso-content";
import { latestPublicCars } from "@/app/lib/community-data";
import { safeCarImage } from "@/app/lib/community";
import CarCard from "@/components/garage/CarCard";
import ContactForm from "@/components/contact/ContactForm";
import AdBanner from "@/components/ads/AdBanner";
import { isValidAdsenseSlot } from "@/app/lib/adsense";
import SponsorSpotlight from "@/components/ads/SponsorSpotlight";

export const revalidate = 60;

export default async function HomePage() {
  const [{ events }, { routes }, { partners }, cars] = await Promise.all([
    listPublicEvents(), listPublicRoutes(), listPublicPartners(), latestPublicCars(3),
  ]);
  const nextEvent = events[0] || null;
  const featuredRoute = routes.find((item) => item.coordinates && item.coordinates.length > 1) || routes[0] || null;
  const featuredPartner = partners.find((item) => item.is_featured) || partners[0] || null;
  const garageSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_GARAGE?.trim() ?? "";

  return (
    <main className="min-h-screen overflow-hidden bg-[#08090a] text-white">
      <section className="relative isolate border-b border-white/10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_30%,rgba(255,106,0,0.08),transparent_43%),linear-gradient(180deg,#08090a,#101112)]" />
        <div className="mx-auto grid min-h-[670px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-5 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div>
            <p className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-orange-500"><span className="h-2 w-2 rounded-full bg-orange-500" /> Nacido en Gran Canaria. Sin limites.</p>
            <h1 className="mt-7 max-w-3xl text-balance text-5xl font-black uppercase leading-[1.02] tracking-[0.025em] sm:text-7xl lg:text-[5.5rem]">
              No es solo <span className="text-orange-500">un coche.</span> Es tu historia.
            </h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-zinc-400 sm:text-lg">Una comunidad hecha por y para quienes viven el motor. Crea tu garaje, encuentra quedadas, descubre rutas y comparte cada etapa de tu proyecto.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex items-center gap-3 rounded-xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-black transition hover:bg-orange-400">
                Unirme gratis <MdArrowOutward size={18} />
              </Link>
              <Link href="/garage" className="inline-flex items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:border-white/60">
                Explorar Garage
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-6 border-t border-white/10 pt-7 text-xs uppercase tracking-widest text-zinc-500">
              <span>100% comunidad</span><span>Sin cuotas</span><span>Coches reales</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-3 rounded-[2.3rem] border border-orange-500/10" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900">
              {nextEvent?.cover_image_url ? (
                <Image src={nextEvent.cover_image_url} alt={nextEvent.title} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-80" />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,rgba(255,106,0,0.20),transparent_35%),repeating-linear-gradient(125deg,transparent_0,transparent_35px,rgba(255,255,255,.025)_36px,transparent_37px),linear-gradient(135deg,#27272a,#050505)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
              <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur">Tramassso / Motor culture</div>
              <div className="absolute inset-x-6 bottom-7">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-500">{nextEvent ? "Proxima quedada" : "Estamos construyendo algo grande"}</p>
                <h2 className="mt-3 text-3xl font-black uppercase leading-tight tracking-wide sm:text-4xl">{nextEvent?.title || "Tu pasion. Tu gente. Tu sitio."}</h2>
                <p className="mt-3 text-sm text-zinc-300">{nextEvent ? nextEvent.location : "Forma parte desde el principio."}</p>
                <Link href={nextEvent ? "/events/" + nextEvent.id : "/events"} className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white hover:text-orange-500">Descubre los eventos <MdArrowOutward size={18} /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500">01 / Community Garage</p>
            <h2 className="mt-4 text-4xl font-black uppercase tracking-wide sm:text-5xl">Los coches de la gente.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400">Detras de cada coche hay una historia. Enseña el tuyo y descubre como otros viven su proyecto.</p>
          </div>
          <Link href="/garage" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-500 hover:text-white">Ver todo el Garage <MdArrowOutward /></Link>
        </div>
        {cars.length ? <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{cars.map((car) => <CarCard key={car.id} car={car} />)}</div> :
          <div className="mt-9 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative flex min-h-[290px] flex-col justify-end overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-700/50 via-zinc-900 to-black p-8">
              <p className="font-aeroblade text-6xl uppercase tracking-wide text-white/10 sm:text-8xl">Tramassso.</p>
              <div className="relative mt-8"><h3 className="text-2xl font-black uppercase">Tu coche merece su espacio.</h3><p className="mt-3 text-sm text-zinc-400">Publica la primera ficha del Garage Tramassso.</p></div>
            </div>
            <div className="flex flex-col justify-center rounded-3xl border border-orange-500/20 bg-orange-500/[0.06] p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-500">Gratis desde el primer dia</p><h3 className="mt-4 text-2xl font-black uppercase">Crea. Comparte. Conecta.</h3>
              <p className="mt-4 text-sm leading-7 text-zinc-400">Guarda las especificaciones de tu coche, sube su foto y consigue un enlace que podras compartir en tus historias.</p>
              <Link href="/garage/new" className="mt-7 inline-flex w-fit rounded-xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-black">Crear mi garaje ↗</Link>
            </div>
          </div>}
        <SponsorSpotlight placement="home" />
        {isValidAdsenseSlot(garageSlot) ? <div className="mt-8"><AdBanner slot={garageSlot} label="Publicidad" /></div> : null}
      </section>

      <section className="border-y border-white/10 bg-[#111214] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div><p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500">02 / Meets & Events</p><h2 className="mt-4 text-4xl font-black uppercase tracking-wide sm:text-5xl">Nos vemos en persona.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400">Las mejores historias empiezan al apagar el motor y conocer a quien tienes al lado.</p></div>
            <Link href="/events" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-500">Todos los eventos <MdArrowOutward /></Link>
          </div>
          {events.length ? <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.slice(0, 3).map((event) => (
              <Link href={"/events/" + event.id} key={event.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 transition hover:border-orange-500/40">
                <div className="relative aspect-[16/10] bg-zinc-800">
                  {event.cover_image_url ? <Image src={event.cover_image_url} alt={event.title} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition group-hover:scale-105" /> :
                    <div className="flex h-full items-center justify-center text-5xl text-white/10"><MdCalendarMonth /></div>}
                </div>
                <div className="p-6"><p className="text-xs font-bold uppercase tracking-widest text-orange-500">{new Date(event.date).toLocaleDateString("es-ES", { timeZone: "Atlantic/Canary", day: "2-digit", month: "short", year: "numeric" })}</p>
                  <h3 className="mt-3 text-xl font-black uppercase">{event.title}</h3><p className="mt-3 text-sm text-zinc-500">{event.location}</p></div>
              </Link>
            ))}
          </div> : <div className="mt-9 rounded-3xl border border-white/10 p-10 text-sm text-zinc-400">Los proximos eventos se anunciaran aqui. Sigue la comunidad para enterarte.</div>}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-20 sm:px-5 lg:grid-cols-3 lg:px-8">
        <Link href={featuredRoute ? "/routes/" + featuredRoute.id : "/routes"} className="group flex min-h-[315px] flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8 transition hover:border-orange-500/40">
          <MdMap className="text-orange-500" size={35} /><div><p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">03 / Rutas</p><h2 className="mt-4 text-3xl font-black uppercase">{featuredRoute?.title || "El camino tambien importa."}</h2><p className="mt-3 text-sm text-zinc-400">{featuredRoute ? featuredRoute.start_point + " · " + featuredRoute.distance_km + " km" : "Explora trazados de Gran Canaria preparados para disfrutar de la carretera."}</p><span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase text-orange-500">Explorar rutas <MdArrowOutward /></span></div>
        </Link>
        <Link href="/clubs" className="group flex min-h-[315px] flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8 transition hover:border-orange-500/40">
          <MdDirectionsCar className="text-orange-500" size={35} /><div><p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">05 / Clubes</p>
          <h2 className="mt-4 text-3xl font-black uppercase">Encuentra a tu gente.</h2>
          <p className="mt-3 text-sm text-zinc-400">Crea tu propio club o solicita unirte a los grupos de la comunidad, gratis.</p>
          <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase text-orange-500">Ver clubes <MdArrowOutward /></span></div>
        </Link>
        <Link href={featuredPartner ? "/partners/" + featuredPartner.id : "/partners"} className="group flex min-h-[315px] flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8 transition hover:border-orange-500/40">
          <MdOutlineHandshake className="text-orange-500" size={35} /><div><p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">04 / Colaboradores</p><h2 className="mt-4 text-3xl font-black uppercase">{featuredPartner?.name || "La industria se mueve con nosotros."}</h2><p className="mt-3 text-sm text-zinc-400">{featuredPartner?.category || "Negocios, talleres y marcas que comparten nuestra pasion."}</p><span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase text-orange-500">Ver colaboradores <MdArrowOutward /></span></div>
        </Link>
      </section>

      <section className="border-t border-white/10 bg-[#111214] py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-5 lg:grid-cols-2 lg:px-8">
          <div><p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500">Tu comunidad te espera</p><h2 className="mt-5 text-4xl font-black uppercase leading-tight sm:text-5xl">La carretera es mejor en compañia.</h2><p className="mt-5 max-w-md text-sm leading-7 text-zinc-400">Forma parte de Tramassso sin cuotas. Tu perfil, tus coches y tus planes. Todo en un mismo sitio.</p></div>
          <div className="flex flex-col items-start gap-4 rounded-3xl border border-orange-500/20 bg-orange-500/[0.05] p-8">
            <MdDirectionsCar className="text-orange-500" size={38} /><p className="text-xl font-black uppercase">El siguiente proyecto es el tuyo.</p>
            <Link href="/register" className="rounded-xl bg-orange-500 px-8 py-4 text-xs font-black uppercase tracking-widest text-black">Crear cuenta gratis ↗</Link>
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto grid max-w-7xl gap-9 px-4 py-20 sm:px-5 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div><p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500">Marcas / Publicidad / Colaboraciones</p>
          <h2 className="mt-5 text-4xl font-black uppercase">Crezcamos juntos.</h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-zinc-400">¿Tienes un taller, un negocio o una marca del motor? Hablemos de colaboraciones y espacios publicitarios identificados.</p>
        </div>
        <ContactForm />
      </section>
    </main>
  );
}
