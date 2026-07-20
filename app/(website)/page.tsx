import Link from "next/link";
import { MdEmail, MdInsights, MdLocationOn, MdOutlineCameraAlt, MdOutlineHandshake, MdSpeed, MdStraighten } from "react-icons/md";
import { listPublicEvents, listPublicPartners, listPublicRoutes } from "@/app/lib/tramassso-content";

export const revalidate = 60;

export default async function HomePage() {
  const [{ events }, { routes }, { partners }] = await Promise.all([
    listPublicEvents(),
    listPublicRoutes(),
    listPublicPartners(),
  ]);
  const nextEvent = events[0] ?? null;
  const featuredRoute = routes.find((route) => route.coordinates && route.coordinates.length >= 2) ?? routes[0] ?? null;
  const featuredPartner = partners.find((partner) => partner.is_featured) ?? partners[0] ?? null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-50">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-5 sm:py-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:px-8 lg:py-20">
        <div className="space-y-7">
          <div className="space-y-4">
            <p className="racing-eyebrow text-[10px] uppercase tracking-[0.32em] text-zinc-500 sm:text-xs sm:tracking-[0.5em]">Gran Canaria</p>
            <h1 className="max-w-3xl text-4xl font-black uppercase leading-tight tracking-[0.05em] text-white sm:text-5xl sm:tracking-[0.08em] md:text-6xl lg:text-7xl">
              Motor, rutas y comunidad.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-zinc-400 md:text-base">
              Eventos seleccionados, rutas con caracter y marcas conectadas al mundo del motor.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="racing-card rounded-[1.35rem] border p-4 sm:rounded-3xl sm:p-5">
              <MdInsights className="relative z-10 text-red-300" size={20} />
              <p className="mt-3 text-2xl font-black text-white sm:text-3xl">{events.length}</p>
              <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-500 sm:text-[10px] sm:tracking-[0.3em]">Eventos</p>
            </div>
            <div className="racing-card rounded-[1.35rem] border p-4 sm:rounded-3xl sm:p-5">
              <MdLocationOn className="relative z-10 text-red-300" size={20} />
              <p className="mt-3 text-2xl font-black text-white sm:text-3xl">GC</p>
              <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-500 sm:text-[10px] sm:tracking-[0.3em]">Local</p>
            </div>
            <div className="racing-card rounded-[1.35rem] border p-4 sm:rounded-3xl sm:p-5">
              <MdSpeed className="relative z-10 text-red-300" size={20} />
              <p className="mt-3 text-2xl font-black text-white sm:text-3xl">{routes.length}</p>
              <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-500 sm:text-[10px] sm:tracking-[0.3em]">Rutas</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/events" className="racing-button w-full rounded-full px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.25em] transition sm:w-auto sm:py-3 sm:text-xs sm:tracking-[0.35em]">
              Ver eventos
            </Link>
            <Link href="/routes" className="w-full rounded-full border border-white/15 px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-200 transition hover:border-red-500/60 hover:text-white sm:w-auto sm:py-3 sm:text-xs sm:tracking-[0.35em]">
              Explorar rutas
            </Link>
            <Link href="#contact" className="w-full rounded-full border border-white/15 px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-200 transition hover:border-red-500/60 hover:text-white sm:w-auto sm:py-3 sm:text-xs sm:tracking-[0.35em]">
              Contactar
            </Link>
          </div>
        </div>

        <div className="racing-panel rounded-[1.5rem] p-2 sm:rounded-[2rem] sm:p-3">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.2rem] border border-white/5 bg-black sm:rounded-[1.6rem]">
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
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <div className="grid gap-3 rounded-[1.2rem] border border-red-500/25 bg-black/70 p-4 backdrop-blur-md sm:rounded-[1.5rem] sm:p-5">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.22em] text-zinc-500 sm:text-[10px] sm:tracking-[0.4em]">
                  <span>Tramassso GC</span>
                  <span>2026</span>
                </div>
                <div className="grid gap-2 text-xs text-zinc-300 sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span>Eventos</span>
                    <span className="text-white">Seleccionados</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rutas</span>
                    <span className="text-white">Con mapa</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Marcas</span>
                    <span className="text-white">Directo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 sm:gap-5 sm:px-5 sm:pb-14 lg:grid-cols-3 lg:px-8">
        <article className="racing-card rounded-[1.5rem] border p-5 sm:rounded-[2rem] sm:p-6">
          <MdSpeed size={22} className="relative z-10 text-red-300" />
          <h2 className="mt-4 text-xl font-semibold uppercase tracking-[0.1em] text-white sm:text-2xl sm:tracking-[0.16em]">Eventos seleccionados</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Quedadas con ruta, estetica y comunidad.</p>
        </article>
        <article className="racing-card rounded-[1.5rem] border p-5 sm:rounded-[2rem] sm:p-6">
          <MdOutlineHandshake size={22} className="relative z-10 text-red-300" />
          <h2 className="mt-4 text-xl font-semibold uppercase tracking-[0.1em] text-white sm:text-2xl sm:tracking-[0.16em]">Visibilidad para marcas</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Presencia directa en eventos y contenido.</p>
        </article>
        <article className="racing-card rounded-[1.5rem] border p-5 sm:rounded-[2rem] sm:p-6">
          <MdStraighten size={22} className="relative z-10 text-red-300" />
          <h2 className="mt-4 text-xl font-semibold uppercase tracking-[0.1em] text-white sm:text-2xl sm:tracking-[0.16em]">Rutas con caracter</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Trazados por Gran Canaria con mapa.</p>
        </article>
        <article className="racing-card rounded-[1.5rem] border p-5 sm:rounded-[2rem] sm:p-6">
          <MdLocationOn size={22} className="relative z-10 text-red-300" />
          <h2 className="mt-4 text-xl font-semibold uppercase tracking-[0.1em] text-white sm:text-2xl sm:tracking-[0.16em]">Comunidad local</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Motor, creadores y marcas en Gran Canaria.</p>
        </article>
        <article className="racing-card rounded-[1.5rem] border p-5 sm:rounded-[2rem] sm:p-6">
          <MdInsights size={22} className="relative z-10 text-red-300" />
          <h2 className="mt-4 text-xl font-semibold uppercase tracking-[0.1em] text-white sm:text-2xl sm:tracking-[0.16em]">Experiencias premium</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Activaciones cuidadas, sin ruido.</p>
        </article>
        <article className="racing-card rounded-[1.5rem] border p-5 sm:rounded-[2rem] sm:p-6">
          <MdOutlineHandshake size={22} className="relative z-10 text-red-300" />
          <h2 className="mt-4 text-xl font-semibold uppercase tracking-[0.1em] text-white sm:text-2xl sm:tracking-[0.16em]">Patrocinadores</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Formatos listos para rutas y eventos.</p>
        </article>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-5 sm:pb-20 lg:px-8">
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
          <article className="racing-card min-w-0 rounded-[1.5rem] border p-5 sm:rounded-[2rem] sm:p-6">
            <p className="text-[10px] uppercase tracking-[0.32em] text-zinc-500">Proximo evento</p>
            <h2 className="mt-4 break-words font-sans text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {nextEvent ? nextEvent.title : "Proxima salida"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {nextEvent ? `${nextEvent.location} · ${new Date(nextEvent.date).toLocaleDateString("es-ES")}` : "En preparacion."}
            </p>
            <Link href={nextEvent ? `/events/${nextEvent.id}` : "/events"} className="racing-button mt-5 inline-flex rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] transition">
              Ver eventos
            </Link>
          </article>

          <article className="racing-card min-w-0 rounded-[1.5rem] border p-5 sm:rounded-[2rem] sm:p-6">
            <p className="text-[10px] uppercase tracking-[0.32em] text-zinc-500">Ruta destacada</p>
            <h2 className="mt-4 break-words font-sans text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {featuredRoute ? featuredRoute.title : "Nueva ruta"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {featuredRoute ? `${featuredRoute.start_point} · ${featuredRoute.distance_km} km${featuredRoute.coordinates?.length ? " · mapa" : ""}` : "Trazado en preparacion."}
            </p>
            <Link href={featuredRoute ? `/routes/${featuredRoute.id}` : "/routes"} className="racing-button mt-5 inline-flex rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] transition">
              Ver rutas
            </Link>
          </article>

          <article className="racing-card min-w-0 rounded-[1.5rem] border p-5 sm:rounded-[2rem] sm:p-6">
            <p className="text-[10px] uppercase tracking-[0.32em] text-zinc-500">Colaborador</p>
            <h2 className="mt-4 break-words font-sans text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {featuredPartner ? featuredPartner.name : "Marcas en pista"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {featuredPartner ? featuredPartner.category : "Directorio en seleccion."}
            </p>
            <Link href={featuredPartner ? `/partners/${featuredPartner.id}` : "/partners"} className="racing-button mt-5 inline-flex rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] transition">
              Ver colaboradores
            </Link>
          </article>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-3 pb-16 sm:px-5 sm:pb-20 lg:px-8">
        <div className="racing-panel grid min-w-0 gap-5 rounded-[1.5rem] p-5 sm:gap-8 sm:rounded-[2.2rem] sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:p-10">
          <div className="min-w-0 space-y-3 sm:space-y-4">
            <p className="racing-eyebrow text-[9px] uppercase tracking-[0.22em] text-zinc-500 sm:text-xs sm:tracking-[0.45em]">Marcas y colaboraciones</p>
            <h2 className="max-w-full break-words text-[1.65rem] font-black uppercase leading-[1.05] tracking-[0.03em] text-white [overflow-wrap:anywhere] sm:text-4xl sm:tracking-[0.08em]">Entra en la ruta</h2>
            <p className="max-w-lg text-xs leading-relaxed text-zinc-400 sm:text-sm sm:leading-7">Cuentanos que quieres activar y lo movemos.</p>
          </div>

          <form className="grid min-w-0 gap-3 rounded-[1.2rem] border border-white/10 bg-black/40 p-4 sm:gap-4 sm:rounded-[1.6rem] sm:p-5" action="mailto:partnerships@tramassso.com" method="post" encType="text/plain">
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <input aria-label="Nombre" name="name" required placeholder="Nombre" className="min-w-0 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/60 sm:rounded-2xl sm:py-3.5 sm:text-sm" />
              <input aria-label="Correo electronico" name="email" required placeholder="Correo electronico" type="email" className="min-w-0 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/60 sm:rounded-2xl sm:py-3.5 sm:text-sm" />
            </div>
            <input aria-label="Marca o empresa" name="brand" required placeholder="Marca o empresa" className="min-w-0 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/60 sm:rounded-2xl sm:py-3.5 sm:text-sm" />
            <textarea aria-label="Propuesta de colaboracion" name="brief" required rows={4} placeholder="Que quieres activar" className="min-w-0 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/60 sm:rounded-2xl sm:py-3.5 sm:text-sm" />
            <div className="mt-2 grid gap-4 lg:flex lg:items-center lg:justify-between">
              <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-500 sm:text-[10px] sm:tracking-[0.35em]">Contacto directo</p>
              <div className="grid gap-3 sm:flex sm:flex-wrap sm:justify-end">
                <a href="https://www.instagram.com/tramassso_/" target="_blank" rel="noreferrer" className="flex w-full items-center justify-center rounded-full border border-red-500/35 bg-red-500/10 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition hover:border-red-500/70 hover:bg-red-500/20 sm:w-auto sm:px-5 sm:py-3.5 sm:text-xs sm:tracking-[0.32em]">
                  <MdOutlineCameraAlt size={16} className="inline-block" />
                  <span className="ml-2">DM Instagram</span>
                </a>
                <button type="submit" className="racing-button flex w-full items-center justify-center rounded-full px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] transition sm:w-auto sm:px-5 sm:py-3.5 sm:text-xs sm:tracking-[0.32em]">
                  <MdEmail size={16} className="inline-block" />
                  <span className="ml-2">Enviar solicitud</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
