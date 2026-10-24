import Link from "next/link";
import { getPublicStats } from "@/app/lib/tramassso-content";

export default async function WebsiteFooter() {
  const stats = await getPublicStats();
  return (
    <footer className="border-t border-white/10 bg-[#070808] px-4 py-14 text-white sm:px-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-3">
          <div><Link href="/" className="font-aeroblade text-2xl font-black tracking-wider">Tramassso<span className="text-orange-500">.</span></Link>
            <p className="mt-5 max-w-xs text-sm leading-7 text-zinc-500">Cultura del motor, proyectos reales y gente que comparte una misma pasion. Desde Gran Canaria.</p>
          </div>
          <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-500">Explora</p>
            <div className="mt-5 grid gap-3 text-sm text-zinc-400">
              <Link href="/garage" className="hover:text-white">Garage de la comunidad</Link>
              <Link href="/clubs" className="hover:text-white">Clubes</Link>
              <Link href="/events" className="hover:text-white">Eventos</Link>
              <Link href="/routes" className="hover:text-white">Rutas</Link>
              <Link href="/partners" className="hover:text-white">Colaboradores</Link>
            </div>
          </div>
          <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-500">La comunidad</p>
            <p className="mt-5 text-sm text-zinc-400">{stats.events} eventos · {stats.routes} rutas · {stats.partners} colaboradores publicados</p>
            <Link href="/register" className="mt-6 inline-flex rounded-xl border border-orange-500/50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-orange-500 hover:border-orange-500">Unirme gratis ↗</Link>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-zinc-500">
          <span>© {new Date().getFullYear()} Tramassso.</span>
          <div className="flex flex-wrap gap-5"><Link href="/privacidad" className="hover:text-white">Privacidad y cookies</Link><Link href="/about" className="hover:text-white">Sobre nosotros</Link><a href="https://www.instagram.com/tramassso_/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram ↗</a></div>
        </div>
      </div>
    </footer>
  );
}
