import Link from "next/link";
import type { Metadata } from "next";
import { communityRegistrationReady } from "@/app/lib/community-security";
import { buildPremiumMetadata } from "@/app/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPremiumMetadata({
  title: "Empieza en Tramassso",
  description: "Descubre todo lo que puedes hacer en Tramassso: Garage, eventos, rutas, clubes y aficionados al motor.",
  path: "/empezar",
});

export default function StartPage() {
  const registrationOpen = communityRegistrationReady();
  const steps = [
    { label: "01", title: "Explora los coches", description: "Descubre proyectos reales, modificaciones y garajes que comparten los miembros.", href: "/garage", action: "Ver Garage" },
    { label: "02", title: "Conoce a la comunidad", description: "Encuentra conductores, descubre sus coches y conoce nuevos clubes de motor.", href: "/members", action: "Ver miembros" },
    { label: "03", title: "Apúntate a un encuentro", description: "Consulta el calendario y revisa las condiciones de cada evento.", href: "/events", action: "Ver eventos" },
    { label: "04", title: "Descubre rutas", description: "Explora lugares y trazados compartidos para disfrutar de la carretera.", href: "/routes", action: "Explorar rutas" },
  ];
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-16 text-white sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-400">Tramassso / Empieza aquí</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-black uppercase leading-tight sm:text-7xl">
          Tu pasión. Tu gente. Tu sitio.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400">
          No hace falta tener el coche perfecto para formar parte de esto. Descubre qué se mueve en Tramassso
          y encuentra la parte de la comunidad que más encaje contigo.
        </p>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {steps.map((step) => <Link key={step.label} href={step.href}
            className="group flex min-h-[230px] flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-7 transition hover:border-orange-500/50">
            <span className="text-xs font-black tracking-[0.3em] text-orange-400">{step.label} / START</span>
            <div><h2 className="text-2xl font-black uppercase">{step.title}</h2>
              <p className="mt-3 max-w-sm text-sm leading-7 text-zinc-400">{step.description}</p>
              <span className="mt-5 inline-flex text-xs font-black uppercase tracking-wider text-orange-400">{step.action} ↗</span>
            </div>
          </Link>)}
        </div>
        <div className="mt-10 rounded-3xl border border-orange-500/25 bg-orange-500/[0.06] p-7 sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">Hazlo tuyo</p>
          <h2 className="mt-4 text-3xl font-black uppercase">El próximo proyecto es el tuyo.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            {registrationOpen
              ? "Crea tu cuenta gratis, publica tu coche y empieza a conectar con otros aficionados."
              : "El registro de nuevas cuentas está temporalmente cerrado mientras verificamos el sistema. Puedes explorar los contenidos públicos desde ya."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={registrationOpen ? "/register" : "/events"}
              className="rounded-xl bg-orange-500 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-black">
              {registrationOpen ? "Crear cuenta gratis" : "Explorar próximos eventos"} ↗
            </Link>
            <Link href="/login" className="rounded-xl border border-white/20 px-6 py-3.5 text-xs font-bold uppercase tracking-wider">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
