import Image from "next/image";
import Link from "next/link";
import { listPublicEvents, listPublicPartners, listPublicRoutes } from "@/app/lib/tramassso-content";
import { latestPublicCars } from "@/app/lib/community-data";
import CarCard from "@/components/garage/CarCard";
import ContactForm from "@/components/contact/ContactForm";
import AdBanner from "@/components/ads/AdBanner";
import SponsorSpotlight from "@/components/ads/SponsorSpotlight";
import DiscoveryCard from "@/components/ui/DiscoveryCard";
import TramasssoIcon from "@/components/ui/TramasssoIcon";
import { isValidAdsenseSlot } from "@/app/lib/adsense";
import { communityRegistrationReady } from "@/app/lib/community-security";

export const revalidate = 60;

export default async function HomePage() {
  const [{ events }, { routes }, { partners }, cars] = await Promise.all([
    listPublicEvents(), listPublicRoutes(), listPublicPartners(), latestPublicCars(3),
  ]);
  const nextEvent = events[0] || null;
  const featuredRoute = routes.find((item) => item.coordinates && item.coordinates.length > 1) || routes[0] || null;
  const featuredPartner = partners.find((item) => item.is_featured) || partners[0] || null;
  const garageSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_GARAGE?.trim() ?? "";
  const registrationOpen = communityRegistrationReady();

  return (
    <main className="min-h-screen overflow-hidden bg-[#08090a] text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_32%,rgba(255,106,0,0.11),transparent_48%),linear-gradient(180deg,#0c0c0e,#08090a)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 sm:px-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:px-8 lg:py-24">
          <div className="min-w-0">
            <span className="trm-pill"><span className="h-1.5 w-1.5 rounded-full bg-orange-400" /> Nacido en Gran Canaria</span>
            <h1 className="mt-7 max-w-3xl text-balance font-sans text-[clamp(3rem,6.5vw,6.2rem)] font-black uppercase leading-[0.99] tracking-[-0.065em]">
              Tu coche.<br /><span className="text-orange-500">Tu historia.</span><br />Tu gente.
            </h1>
            <p className="mt-7 max-w-lg text-base leading-8 text-zinc-400 sm:text-lg">
              El punto de encuentro para quienes viven el motor. Comparte tu proyecto, descubre coches reales, encuentra rutas y participa en quedadas.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={registrationOpen ? "/register" : "/empezar"} className="trm-action">
                {registrationOpen ? "Unirme gratis" : "Conoce Tramassso"}
                <TramasssoIcon name="arrow" size="sm" frame={false} />
              </Link>
              <Link href="/garage" className="trm-action-secondary">
                <TramasssoIcon name="garage" size="sm" frame={false} />
                Explorar Garage
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6">
              {["Comunidad gratuita", "Proyectos reales", "Motor sin etiquetas"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.075em] text-zinc-500">
                  <TramasssoIcon name="check" frame={false} size="sm" className="text-orange-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative min-w-0">
            <div aria-hidden="true" className="pointer-events-none absolute -inset-3 rounded-[2rem] border border-orange-500/10" />
            <Link href={nextEvent ? "/events/" + nextEvent.id : "/events"}
              className="group relative flex min-h-[490px] flex-col justify-between overflow-hidden rounded-[1.8rem] border border-white/15 bg-[#151517] shadow-[0_32px_80px_rgba(0,0,0,.38)] transition-colors hover:border-orange-500/55 sm:min-h-[550px]">
              {nextEvent?.cover_image_url ? (
                <Image src={nextEvent.cover_image_url} alt={nextEvent.title} fill priority
                  sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover opacity-70 transition-transform duration-700 group-hover:scale-[1.035]" />
              ) : (
                <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_70%_32%,rgba(255,106,0,.2),transparent_39%),repeating-linear-gradient(135deg,transparent_0,transparent_34px,rgba(255,255,255,.018)_35px,transparent_36px),linear-gradient(145deg,#281b16,#09090b_78%)]" />
              )}
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="relative flex items-center justify-between gap-3 p-6 sm:p-8">
                <span className="trm-pill border-white/20 bg-black/55 text-zinc-200">Próxima quedada</span>
                <TramasssoIcon name="events" size="lg" className="border-white/20 bg-black/50 text-orange-300" />
              </div>
              {!nextEvent?.cover_image_url ? (
                <div aria-hidden="true" className="relative flex flex-1 items-center justify-center">
                  <span className="font-aeroblade text-7xl text-white/[0.07] sm:text-8xl">TRM.</span>
                </div>
              ) : <div className="flex-1" />}
              <div className="relative p-6 pt-20 sm:p-8 sm:pt-28">
                <span className="trm-kicker">{nextEvent ? new Date(nextEvent.date).toLocaleDateString("es-ES", { timeZone: "Atlantic/Canary", day: "numeric", month: "long", year: "numeric" }) : "La próxima historia empieza aquí"}</span>
                <h2 className="trm-card-title mt-3 text-3xl leading-[1.12] sm:text-[2.6rem]">
                  {nextEvent?.title || "Nos vemos en la carretera."}
                </h2>
                <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-zinc-300">
                  <TramasssoIcon name="location" frame={false} size="sm" className="mt-0.5 text-orange-400" />
                  {nextEvent?.location || "Gran Canaria"}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 border-t border-white/20 pt-5 text-xs font-black uppercase tracking-wider text-white">
                  Ver encuentro <TramasssoIcon name="arrow" frame={false} size="sm" className="text-orange-400" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-5 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="trm-kicker">01 / Garage de la comunidad</p>
            <h2 className="mt-3 max-w-2xl text-balance font-sans text-4xl font-black uppercase leading-[1.05] tracking-[-0.04em] sm:text-5xl">Cada coche cuenta algo.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400">Fichas, fotos, modificaciones e historias. Sin importar los caballos o el presupuesto.</p>
          </div>
          <Link href="/garage" className="trm-action-secondary">
            Ver Garage <TramasssoIcon name="arrow" frame={false} size="sm" />
          </Link>
        </div>
        {cars.length ? (
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => <CarCard key={car.id} car={car} />)}
          </div>
        ) : (
          <div className="mt-9 grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
            <div className="trm-surface relative flex min-h-[270px] flex-col justify-between overflow-hidden p-8">
              <span aria-hidden="true" className="pointer-events-none absolute -right-4 -top-8 font-aeroblade text-7xl text-white/[0.04] sm:text-9xl">TRM.</span>
              <TramasssoIcon name="garage" size="lg" />
              <div className="relative">
                <p className="trm-kicker">La primera plaza está libre</p>
                <h3 className="mt-3 font-sans text-2xl font-black uppercase tracking-tight">Tu coche merece estar aquí.</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">La comunidad empieza con las historias que compartimos.</p>
              </div>
            </div>
            <div className="trm-surface flex flex-col justify-center p-8">
              <span className="trm-pill w-fit">Gratis desde el primer día</span>
              <h3 className="mt-5 font-sans text-2xl font-black uppercase leading-tight tracking-tight">Sube. Comparte. Conecta.</h3>
              <p className="mt-4 text-sm leading-7 text-zinc-400">Guarda las características de tu coche, añade sus fotos y comparte tu ficha con un enlace propio.</p>
              <Link href="/garage/new" className="trm-action mt-7 w-fit">
                Publicar mi coche <TramasssoIcon name="arrow" frame={false} size="sm" />
              </Link>
            </div>
          </div>
        )}
        <SponsorSpotlight placement="home" />
        {isValidAdsenseSlot(garageSlot) ? <div className="mt-8"><AdBanner slot={garageSlot} label="Publicidad" /></div> : null}
      </section>

      <section className="border-y border-white/10 bg-[#101113] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="trm-kicker">02 / Encuentros</p>
              <h2 className="mt-3 font-sans text-4xl font-black uppercase leading-[1.05] tracking-[-0.04em] sm:text-5xl">Lo mejor pasa fuera.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400">Nos vemos, compartimos proyectos y hacemos kilómetros juntos.</p>
            </div>
            <Link href="/events" className="trm-action-secondary">
              Todos los eventos <TramasssoIcon name="arrow" size="sm" frame={false} />
            </Link>
          </div>
          {events.length ? (
            <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {events.slice(0, 3).map((event) => (
                <Link key={event.id} href={"/events/" + event.id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0b0c0e] transition-colors hover:border-orange-500/50">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#17181a]">
                    {event.cover_image_url ? (
                      <Image src={event.cover_image_url} alt={event.title} fill
                        sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle,rgba(255,106,0,.12),transparent_65%)]">
                        <TramasssoIcon name="events" size="lg" />
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4">
                      <span className="trm-pill border-white/10 bg-black/80">
                        {new Date(event.date).toLocaleDateString("es-ES", { timeZone: "Atlantic/Canary", day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="trm-card-title text-xl leading-snug">{event.title}</h3>
                    <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-zinc-400">
                      <TramasssoIcon name="location" size="sm" frame={false} className="mt-0.5 text-orange-400" />
                      {event.location}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-6 text-xs font-extrabold uppercase tracking-wider text-orange-400">
                      Ver evento <TramasssoIcon name="arrow" frame={false} size="sm" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="trm-surface mt-9 flex items-center gap-4 p-7">
              <TramasssoIcon name="events" size="lg" />
              <p className="text-sm text-zinc-400">Los próximos eventos se anunciarán aquí.</p>
            </div>
          )}
        </div>
      </section>

      <section aria-label="Más formas de vivir Tramassso" className="mx-auto max-w-7xl px-4 py-16 sm:px-5 lg:px-8 lg:py-20">
        <div className="mb-8">
          <p className="trm-kicker">Más allá del Garage</p>
          <h2 className="mt-3 font-sans text-3xl font-black uppercase tracking-[-0.035em] sm:text-4xl">Descubre tu próximo plan.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <DiscoveryCard href={featuredRoute ? "/routes/" + featuredRoute.id : "/routes"}
            number="03" category="Rutas" title={featuredRoute?.title || "El camino también importa."}
            description={featuredRoute ? featuredRoute.start_point + " · " + featuredRoute.distance_km + " km" : "Encuentra carreteras y rincones de Gran Canaria que merecen disfrutarse."}
            action="Explorar rutas" icon="routes" />
          <DiscoveryCard href="/clubs" number="04" category="Clubes"
            title="Encuentra a tu gente."
            description="Únete a los clubes de tu estilo o crea tu propio grupo. Gratis, sin complicaciones."
            action="Ver clubes" icon="clubs" />
          <DiscoveryCard href={featuredPartner ? "/partners/" + featuredPartner.id : "/partners"}
            number="05" category="Colaboradores"
            title={featuredPartner?.name || "Marcas que viven el motor."}
            description={featuredPartner?.category || "Talleres, negocios y proyectos que impulsan nuestra comunidad."}
            action="Ver colaboradores" icon="partners" />
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#101113] py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-5 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <p className="trm-kicker">Tu comunidad te espera</p>
            <h2 className="mt-4 max-w-2xl font-sans text-4xl font-black uppercase leading-[1.08] tracking-[-0.045em] sm:text-5xl">
              La carretera es mejor en compañía.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-zinc-400">Tu perfil, tus coches y tus planes. Todo en un mismo lugar, sin cuotas.</p>
          </div>
          <div className="trm-surface p-7 sm:p-8">
            <TramasssoIcon name="members" size="lg" />
            <h3 className="mt-5 font-sans text-xl font-black uppercase tracking-tight">El siguiente proyecto es el tuyo.</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Empieza formando parte de una comunidad de motor real.</p>
            <Link href={registrationOpen ? "/register" : "/empezar"} className="trm-action mt-6">
              {registrationOpen ? "Crear cuenta gratis" : "Descubre el proyecto"}
              <TramasssoIcon name="arrow" frame={false} size="sm" />
            </Link>
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto grid max-w-7xl gap-9 px-4 py-16 sm:px-5 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-20">
        <div>
          <TramasssoIcon name="partners" size="lg" />
          <p className="trm-kicker mt-6">Marcas / Publicidad / Colaboraciones</p>
          <h2 className="mt-3 font-sans text-4xl font-black uppercase tracking-tight">Crezcamos juntos.</h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-zinc-400">
            ¿Tienes un taller, una tienda o una marca del motor? Hablemos de colaboraciones y espacios publicitarios identificados.
          </p>
        </div>
        <ContactForm />
      </section>
    </main>
  );
}
