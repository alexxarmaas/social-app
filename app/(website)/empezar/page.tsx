import Link from "next/link";
import TramasssoIcon from "@/components/ui/TramasssoIcon";
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
    { label: "01", title: "Explora los coches", description: "Descubre proyectos reales, modificaciones y garajes que comparten los miembros.", href: "/garage", action: "Ver Garage", icon: "garage" as const },
    { label: "02", title: "Conoce a la comunidad", description: "Encuentra conductores, descubre sus coches y conoce nuevos clubes de motor.", href: "/members", action: "Ver miembros", icon: "members" as const },
    { label: "03", title: "Apúntate a un encuentro", description: "Consulta el calendario y revisa las condiciones de cada evento.", href: "/events", action: "Ver eventos", icon: "events" as const },
    { label: "04", title: "Descubre rutas", description: "Explora lugares y trazados compartidos para disfrutar de la carretera.", href: "/routes", action: "Explorar rutas", icon: "routes" as const },
  ];
  return (
    <main className="min-h-screen bg-[#08090a] px-4 pb-20 pt-12 text-white sm:pt-16">
      <div className="mx-auto max-w-6xl">
        <span className="trm-pill"><TramasssoIcon name="compass" frame={false} size="sm" /> Tu punto de partida</span>
        <h1 className="mt-5 max-w-4xl font-sans text-[clamp(2.8rem,5.8vw,5rem)] font-black uppercase leading-[1.03] tracking-[-0.05em]">
          Tu pasión.<br /><span className="text-orange-500">Tu gente.</span> Tu sitio.
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-8 text-zinc-400 sm:text-base">
          No hace falta tener el coche perfecto. Descubre qué se mueve en Tramassso y empieza por lo que más te guste.
        </p>
        <div className="mt-11 grid gap-5 md:grid-cols-2">
          {steps.map((step) => (
            <Link key={step.label} href={step.href} className="trm-discovery-card group flex min-w-0 flex-col p-7">
              <div className="flex items-center justify-between">
                <TramasssoIcon name={step.icon} size="lg" />
                <span className="text-[11px] font-bold tracking-wider text-zinc-600">{step.label} / 04</span>
              </div>
              <h2 className="trm-card-title mt-7 text-[1.7rem] leading-tight">{step.title}</h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-zinc-400">{step.description}</p>
              <span className="mt-auto inline-flex items-center gap-2 pt-7 text-xs font-black uppercase tracking-wider text-orange-400">
                {step.action} <TramasssoIcon name="arrow" frame={false} size="sm" />
              </span>
            </Link>
          ))}
        </div>
        <div className="trm-surface mt-10 flex flex-wrap items-center justify-between gap-8 p-7 sm:p-10">
          <div className="max-w-2xl">
            <span className="trm-pill"><TramasssoIcon name="zap" frame={false} size="sm" /> Hazlo tuyo</span>
            <h2 className="mt-5 font-sans text-3xl font-black uppercase tracking-tight">El próximo proyecto es el tuyo.</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-400">
              {registrationOpen
                ? "Crea tu cuenta gratis, publica tu coche y conecta con otros aficionados."
                : "El registro está temporalmente cerrado. Puedes explorar los contenidos públicos desde ya."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={registrationOpen ? "/register" : "/events"} className="trm-action">
              {registrationOpen ? "Crear cuenta gratis" : "Ver próximos eventos"}
              <TramasssoIcon name="arrow" frame={false} size="sm" />
            </Link>
            <Link href="/login" className="trm-action-secondary">Ya tengo cuenta</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
