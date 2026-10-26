import Link from "next/link";
import TramasssoIcon from "@/components/ui/TramasssoIcon";
import { getPublicStats } from "@/app/lib/tramassso-content";
import { communityRegistrationReady } from "@/app/lib/community-security";

const sections = [
  { name: "Garage", href: "/garage" }, { name: "Comunidad", href: "/community" },
  { name: "Miembros", href: "/members" }, { name: "Clubes", href: "/clubs" },
  { name: "Eventos", href: "/events" }, { name: "Rutas", href: "/routes" },
];

export default async function WebsiteFooter() {
  const stats = await getPublicStats();
  const registrationOpen = communityRegistrationReady();
  return (
    <footer className="border-t border-white/10 bg-[#08090a] text-white">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-5 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.75fr_1.2fr]">
          <div>
            <Link href="/" aria-label="Tramassso, inicio" className="font-aeroblade text-2xl tracking-[0.04em]">
              Tramassso<span className="text-orange-500">.</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-7 text-zinc-400">
              Cultura del motor, proyectos reales y gente con la misma pasión. Hecho desde Gran Canaria.
            </p>
            <a href="https://www.instagram.com/tramassso_/" target="_blank" rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-orange-400 hover:text-orange-300">
              <TramasssoIcon name="instagram" frame={false} size="sm" /> Síguenos en Instagram
              <TramasssoIcon name="arrow" frame={false} size="sm" />
            </a>
          </div>
          <div>
            <p className="trm-kicker">Explora</p>
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-zinc-400 sm:grid-cols-1">
              {sections.map((item) => (
                <Link key={item.href} href={item.href} className="transition-colors hover:text-white">
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="trm-kicker">Tramassso</p>
            <div className="mt-5 grid gap-3 text-sm text-zinc-400">
              <Link href="/mi-tramassso" className="hover:text-white">Mi espacio</Link>
              <Link href="/partners" className="hover:text-white">Colaboradores</Link>
              <Link href="/anunciarse" className="hover:text-white">Patrocinios</Link>
              <Link href="/about" className="hover:text-white">Quiénes somos</Link>
              <Link href="/privacidad" className="hover:text-white">Privacidad y cookies</Link>
            </div>
          </div>
          <div className="trm-surface p-6">
            <TramasssoIcon name="garage" size="md" />
            <h2 className="mt-5 font-sans text-xl font-black uppercase leading-tight tracking-tight">Tu coche merece su espacio.</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {stats.events} eventos · {stats.routes} rutas · {stats.partners} colaboradores.
            </p>
            <Link href={registrationOpen ? "/register" : "/empezar"} className="trm-action mt-6 w-full">
              {registrationOpen ? "Unirme gratis" : "Descubrir Tramassso"}
              <TramasssoIcon name="arrow" size="sm" frame={false} />
            </Link>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-7 text-xs text-zinc-500">
          <span>© {new Date().getFullYear()} Tramassso. Motor culture.</span>
          <span>Hecho en Gran Canaria.</span>
        </div>
      </div>
    </footer>
  );
}
