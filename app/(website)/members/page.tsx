import Link from "next/link";
import TramasssoIcon from "@/components/ui/TramasssoIcon";
import type { Metadata } from "next";
import { prisma } from "@/app/lib/prisma";
import { buildPremiumMetadata } from "@/app/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPremiumMetadata({
  title: "Miembros de Tramassso",
  description: "Conoce a las personas detrás de los proyectos de Tramassso. Explora sus garajes y descubre coches reales.",
  path: "/members",
});

type MemberPreview = {
  username: string;
  bio: string | null;
  location: string | null;
  cars: { make: string; model: string; year: number }[];
  _count: { cars: number };
};

export default async function MembersPage({ searchParams }: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 40) : "";
  let members: MemberPreview[] = [];
  let unavailable = false;
  try {
    // Only list members who have actively published a car, not dormant/legacy accounts.
    members = await prisma.user.findMany({
      where: {
        cars: { some: {} },
        ...(q ? {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { cars: { some: { OR: [
              { make: { contains: q, mode: "insensitive" } },
              { model: { contains: q, mode: "insensitive" } },
            ] } } },
          ],
        } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 48,
      select: {
        username: true, bio: true, location: true,
        cars: { take: 2, orderBy: { createdAt: "desc" }, select: { make: true, model: true, year: true } },
        _count: { select: { cars: true } },
      },
    });
  } catch (error) {
    unavailable = true;
    console.error("Public members directory unavailable", error);
  }

  return (
    <main className="min-h-screen bg-[#08090a] px-4 pb-20 pt-12 text-white sm:pt-16">
      <div className="mx-auto max-w-7xl">
        <span className="trm-pill"><TramasssoIcon name="members" frame={false} size="sm" /> Tramassso / Miembros</span>
        <h1 className="mt-5 font-sans text-[clamp(2.7rem,5.8vw,4.8rem)] font-black uppercase leading-[1.04] tracking-[-0.05em]">Detrás del volante.</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
          Conoce a la gente detrás de cada proyecto. Encuentra aficionados a través de sus garajes y sus coches.
          Solo aparecen perfiles que hayan publicado al menos un vehículo.
        </p>
        <div className="trm-surface mt-9 flex flex-wrap items-end justify-between gap-5 p-5 sm:p-6">
          <form method="get" action="/members" className="flex w-full min-w-0 flex-wrap items-end gap-3 sm:w-auto sm:flex-1">
            <label className="min-w-[195px] flex-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
              Alias o coche
              <input name="q" defaultValue={q} maxLength={40} placeholder="Prelude, E30, tu_alias…"
                className="mt-2 w-full min-w-0 rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-base text-white outline-none focus:border-orange-500" />
            </label>
            <button type="submit" className="trm-action">
              <TramasssoIcon name="search" frame={false} size="sm" /> Buscar
            </button>
            {q ? <Link href="/members" className="trm-action-secondary">Limpiar</Link> : null}
          </form>
          <Link href="/garage/new" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 hover:text-orange-300">
            Publica tu coche para aparecer <TramasssoIcon name="arrow" frame={false} size="sm" />
          </Link>
        </div>
        <div className="mt-10 flex items-center justify-between gap-4">
          <p className="trm-kicker">{q ? "Resultados de la búsqueda" : "Personas de la comunidad"}</p>
          <span className="text-xs text-zinc-500">{members.length} perfiles</span>
        </div>
        {unavailable ? (
          <p role="alert" className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
            El directorio no está disponible en este momento. Los eventos y rutas siguen accesibles.
          </p>
        ) : members.length ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <Link href={"/members/" + encodeURIComponent(member.username)} key={member.username}
                className="trm-discovery-card group flex min-w-0 flex-col p-6">
                <div className="flex items-center gap-4">
                  <span aria-hidden="true" className="trm-icon-frame h-14 w-14 shrink-0 rounded-2xl font-sans text-2xl font-black">
                    {member.username.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-sans text-xl font-black tracking-tight">@{member.username}</h2>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                      <TramasssoIcon name="garage" frame={false} size="sm" className="text-orange-400" />
                      {member._count.cars} {member._count.cars === 1 ? "vehículo" : "vehículos"}
                    </p>
                  </div>
                </div>
                {member.bio ? <p className="mt-5 line-clamp-2 text-sm leading-6 text-zinc-400">{member.bio}</p> : null}
                {member.location ? <p className="mt-4 inline-flex items-center gap-2 text-xs text-zinc-500">
                  <TramasssoIcon name="location" frame={false} size="sm" /> {member.location}
                </p> : null}
                <div className="mt-auto border-t border-white/10 pt-5 text-sm text-zinc-300">
                  {member.cars.map((car, index) => (
                    <p key={index} className="truncate">{car.make} {car.model} · {car.year}</p>
                  ))}
                </div>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-400">
                  Ver su garaje <TramasssoIcon name="arrow" frame={false} size="sm" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="trm-surface mt-6 flex flex-col items-center p-10 text-center">
            <TramasssoIcon name="members" size="lg" />
            <h2 className="mt-5 font-sans text-2xl font-black uppercase">
              {q ? "No hay coincidencias." : "Sé quien abra el camino."}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
              {q ? "Prueba con otro alias o marca." : "Publica tu primer coche y forma parte de la comunidad."}
            </p>
            <Link href={q ? "/members" : "/garage/new"} className="trm-action mt-6">
              {q ? "Mostrar todos" : "Publicar mi coche"} <TramasssoIcon name="arrow" frame={false} size="sm" />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
