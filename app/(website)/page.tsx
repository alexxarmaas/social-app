import Link from "next/link";
import { MdEmail, MdInsights, MdLocationOn, MdOutlineHandshake, MdSpeed, MdStraighten } from "react-icons/md";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 overflow-x-hidden">
      <section className="mx-auto grid max-w-7xl gap-8 sm:gap-10 px-4 sm:px-5 py-10 sm:py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-20">
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-3 sm:space-y-4">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.5em] text-zinc-500">Gran Canaria</p>
            <h2 className="max-w-3xl text-4xl sm:text-5xl font-black uppercase tracking-[0.05em] sm:tracking-[0.08em] text-white md:text-6xl lg:text-7xl leading-tight">
              Eventos y rutas de coches deportivos con una experiencia premium.
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
              Tramassso conecta comunidad, rutas, eventos y marcas en una plataforma pensada para amantes del motor y patrocinadores.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-[1.5rem] sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <MdInsights className="text-zinc-300" size={20} />
              <p className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-black text-white">1.2M</p>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.35em] text-zinc-500">Impresiones mensuales</p>
            </div>
            <div className="rounded-[1.5rem] sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <MdLocationOn className="text-zinc-300" size={20} />
              <p className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-black text-white">GC</p>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.35em] text-zinc-500">Alcance local</p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-[1.5rem] sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <MdSpeed className="text-zinc-300" size={20} />
              <p className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-black text-white">Freemium</p>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.35em] text-zinc-500">Modelo</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Link href="/events" className="w-full sm:w-auto text-center rounded-full border border-white/15 bg-black px-6 py-3.5 sm:py-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] sm:tracking-[0.35em] text-white transition hover:border-white hover:bg-zinc-900">
              Ver eventos
            </Link>
            <Link href="/routes" className="w-full sm:w-auto text-center rounded-full border border-white/15 px-6 py-3.5 sm:py-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] sm:tracking-[0.35em] text-zinc-200 transition hover:border-white hover:text-white">
              Explorar rutas
            </Link>
            <Link href="#contact" className="w-full sm:w-auto text-center rounded-full border border-white/15 px-6 py-3.5 sm:py-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] sm:tracking-[0.35em] text-zinc-200 transition hover:border-white hover:text-white">
              Contactar
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 bg-zinc-900/70 p-2 sm:p-3 shadow-2xl sm:shadow-[0_35px_100px_rgba(0,0,0,0.6)]">
          <div className="relative aspect-[4/5] sm:aspect-[4/5] overflow-hidden rounded-[1.2rem] sm:rounded-[1.6rem] border border-white/5 bg-black">
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

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <div className="grid gap-3 rounded-[1.2rem] sm:rounded-[1.5rem] border border-white/10 bg-black/60 p-4 sm:p-5 backdrop-blur-md">
                <div className="flex items-center justify-between text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.4em] text-zinc-500">
                  <span>Dossier patrocinadores GC</span>
                  <span>2026</span>
                </div>
                <div className="grid gap-2 text-xs sm:text-sm text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span>Visibilidad de marca</span>
                    <span className="text-white">Alta</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Afinidad de audiencia</span>
                    <span className="text-white">Premium</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Canal de reserva</span>
                    <span className="text-white">Directo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 sm:gap-6 px-4 sm:px-5 pb-14 sm:pb-20 lg:grid-cols-3 lg:px-8">
        <article className="rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-6">
          <MdSpeed size={22} className="text-zinc-300" />
          <h3 className="mt-3 sm:mt-4 text-xl sm:text-2xl font-semibold uppercase tracking-[0.1em] sm:tracking-[0.16em] text-white">Eventos seleccionados</h3>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed sm:leading-7 text-zinc-400">Encuentros y experiencias pensadas para una comunidad que cuida el detalle, la ruta y la presentación.</p>
        </article>
        <article className="rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-6">
          <MdOutlineHandshake size={22} className="text-zinc-300" />
          <h3 className="mt-3 sm:mt-4 text-xl sm:text-2xl font-semibold uppercase tracking-[0.1em] sm:tracking-[0.16em] text-white">Visibilidad para marcas</h3>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed sm:leading-7 text-zinc-400">Espacios de alto impacto, inventario seleccionado y una presentación limpia pensada para colaboradores del sector motor.</p>
        </article>
        <article className="rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-6">
          <MdStraighten size={22} className="text-zinc-300" />
          <h3 className="mt-3 sm:mt-4 text-xl sm:text-2xl font-semibold uppercase tracking-[0.1em] sm:tracking-[0.16em] text-white">Rutas con carácter</h3>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed sm:leading-7 text-zinc-400">Descubre Gran Canaria con una guía de rutas diseñada para destacar contenido premium y relevancia local.</p>
        </article>
        <article className="rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-6">
          <MdLocationOn size={22} className="text-zinc-300" />
          <h3 className="mt-3 sm:mt-4 text-xl sm:text-2xl font-semibold uppercase tracking-[0.1em] sm:tracking-[0.16em] text-white">Comunidad local</h3>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed sm:leading-7 text-zinc-400">Una red de conductores, creadores y marcas conectada alrededor de la cultura del motor en Gran Canaria.</p>
        </article>
        <article className="rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-6">
          <MdInsights size={22} className="text-zinc-300" />
          <h3 className="mt-3 sm:mt-4 text-xl sm:text-2xl font-semibold uppercase tracking-[0.1em] sm:tracking-[0.16em] text-white">Experiencias premium</h3>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed sm:leading-7 text-zinc-400">Un flujo de contacto directo para eventos seleccionados, patrocinios de ruta y activaciones de marca.</p>
        </article>
        <article className="rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-6">
          <MdOutlineHandshake size={22} className="text-zinc-300" />
          <h3 className="mt-3 sm:mt-4 text-xl sm:text-2xl font-semibold uppercase tracking-[0.1em] sm:tracking-[0.16em] text-white">Preparado para patrocinadores</h3>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed sm:leading-7 text-zinc-400">Formatos publicitarios sobrios y espacios de colaboración listos para campañas, eventos y rutas patrocinadas.</p>
        </article>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-4 sm:px-5 pb-16 sm:pb-20 lg:px-8">
        <div className="grid gap-6 sm:gap-8 rounded-[1.5rem] sm:rounded-[2.2rem] border border-white/10 bg-zinc-900/60 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <div className="space-y-3 sm:space-y-4">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.45em] text-zinc-500">Preparado para patrocinadores</p>
            <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-[0.05em] sm:tracking-[0.08em] text-white">Contacto para colaboraciones</h3>
            <p className="max-w-lg text-xs sm:text-sm leading-relaxed sm:leading-7 text-zinc-400">Cuéntanos tu propuesta de marca, tus objetivos de activación o el tipo de presencia que quieres asociar a rutas y eventos.</p>
          </div>

          <form className="grid gap-3 sm:gap-4 rounded-[1.2rem] sm:rounded-[1.6rem] border border-white/10 bg-black/40 p-4 sm:p-5" action="mailto:partnerships@tramassso.com" method="post" encType="text/plain">
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <input name="name" placeholder="Nombre" className="rounded-xl sm:rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30" />
              <input name="email" placeholder="Correo electrónico" type="email" className="rounded-xl sm:rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30" />
            </div>
            <input name="brand" placeholder="Marca o empresa" className="rounded-xl sm:rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30" />
            <textarea name="brief" rows={5} placeholder="Cuéntanos qué quieres activar" className="rounded-xl sm:rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30" />
            <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-4">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.35em] text-zinc-500">Contacto directo para marcas</p>
              <button type="submit" className="w-full sm:w-auto rounded-full border border-white/15 bg-black px-5 py-3 sm:py-3.5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] sm:tracking-[0.32em] text-white transition hover:border-white hover:bg-zinc-900 flex justify-center items-center">
                <MdEmail size={16} className="inline-block" />
                <span className="ml-2">Enviar solicitud</span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
