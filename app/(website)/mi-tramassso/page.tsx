import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { socialEnabled } from "@/app/lib/community-social";
import { buildOnboardingSteps } from "@/app/lib/onboarding";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mi Tramassso", robots: { index: false, follow: false } };

export default async function MyTramasssoPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=%2Fmi-tramassso");
  const userId = session.user.id;
  const enabled = socialEnabled();

  const [member, ownedClubs, clubMemberships, posts, unread] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true, bio: true, location: true,
        _count: { select: { cars: true } },
      },
    }),
    prisma.club.count({ where: { ownerId: userId } }),
    prisma.clubMember.count({ where: { userId, status: "approved" } }),
    enabled ? prisma.post.count({ where: { authorId: userId, status: "published" } }) : Promise.resolve(0),
    enabled ? prisma.notification.count({ where: { userId, read: false } }) : Promise.resolve(0),
  ]);
  if (!member) redirect("/login");

  const steps = buildOnboardingSteps({
    hasBio: Boolean(member.bio?.trim()),
    carCount: member._count.cars,
    membershipCount: clubMemberships,
    ownedClubCount: ownedClubs,
    approvedPostCount: posts,
    socialEnabled: enabled,
  });
  const done = steps.filter((step) => step.done).length;
  const ratio = Math.round(done / steps.length * 100);
  const next = steps.find((step) => !step.done);
  const shortcuts = [
    { href: "/garage/mine", title: "Mis coches", detail: member._count.cars + " vehículos", icon: "01" },
    { href: "/my-events", title: "Mis eventos", detail: "Inscripciones y entradas", icon: "02" },
    { href: "/clubs", title: "Mis clubes", detail: (ownedClubs + clubMemberships) + " vinculaciones", icon: "03" },
    { href: "/account", title: "Mi perfil", detail: "Datos públicos y privacidad", icon: "04" },
    ...(enabled ? [{ href: "/notifications", title: "Notificaciones", detail: unread + " sin leer", icon: "05" }] : []),
  ];
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-14 text-white sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-400">Tu espacio / Tramassso</p>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-wide sm:text-6xl">Tu sitio en el motor.</h1>
            <p className="mt-5 text-sm leading-7 text-zinc-400">Hola, @{member.username}. Tus coches, planes y comunidad en un solo lugar.</p>
          </div>
          <Link href={"/members/" + encodeURIComponent(member.username)}
            className="rounded-xl border border-orange-500/50 px-6 py-3 text-xs font-bold uppercase tracking-widest text-orange-400 hover:border-orange-500">
            Ver perfil público ↗
          </Link>
        </div>

        <section aria-label="Accesos rápidos" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {shortcuts.map((item) => <Link key={item.href} href={item.href}
            className="group flex min-h-36 flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-5 transition hover:border-orange-500/50">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">{item.icon}</span>
            <div><h2 className="text-lg font-black uppercase">{item.title} ↗</h2><p className="mt-2 text-xs text-zinc-500">{item.detail}</p></div>
          </Link>)}
        </section>

        <section aria-labelledby="next-steps" className="mt-12 grid items-start gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="rounded-3xl border border-orange-500/25 bg-orange-500/[0.06] p-7">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">Empieza por aquí</p>
            <h2 id="next-steps" className="mt-4 text-3xl font-black uppercase">Tu perfil toma forma.</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-400">
              Cuantos más proyectos compartas, más fácil será que otros miembros te encuentren.
            </p>
            <div role="progressbar" aria-label="Pasos iniciales completados"
              aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={done}
              className="mt-7 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-orange-500" style={{ width: ratio + "%" }} />
            </div>
            <p className="mt-3 text-xs text-zinc-400">{done} de {steps.length} pasos completados</p>
            {next ? <Link href={next.href} className="mt-7 inline-flex rounded-xl bg-orange-500 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-black">
              {next.cta} ↗
            </Link> : <p className="mt-7 font-semibold text-orange-300">Ya estás en marcha. ¡Disfruta la comunidad!</p>}
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-900/40 p-6 sm:p-8">
            <h2 className="text-xl font-black uppercase tracking-wider">Tu checklist de arranque</h2>
            <div className="mt-6 space-y-4">
              {steps.map((step, i) => <div key={step.id} className="flex items-start gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                <span aria-hidden="true" className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black " + (step.done ? "bg-orange-500/20 text-orange-300" : "bg-white/10 text-zinc-400")}>
                  {step.done ? "✓" : String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <h3 className="text-sm font-bold">{step.title}</h3>
                  <p className="mt-1 text-xs leading-6 text-zinc-500">{step.description}</p>
                  <Link href={step.href} className="mt-2 inline-flex text-xs font-semibold text-orange-400 underline">
                    {step.done ? "Volver a ver" : step.cta} ↗
                  </Link>
                </div>
              </div>)}
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-7 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">Próximo encuentro</p>
          <h2 className="mt-4 text-2xl font-black uppercase">Nos vemos fuera de la pantalla.</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400">
            Descubre quedadas y rutas reales. Si ya tienes una inscripción vinculada a tu cuenta, podrás consultarla desde Mis eventos.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/events" className="rounded-xl bg-orange-500 px-5 py-3 text-xs font-bold uppercase tracking-wider text-black">Ver eventos</Link>
            <Link href="/members" className="rounded-xl border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-wider">Conocer miembros</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
