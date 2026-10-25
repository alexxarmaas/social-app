import Link from "next/link";
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
    <main className="min-h-screen bg-zinc-950 px-4 py-14 text-white sm:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-400">Tramassso / Personas</p>
        <h1 className="mt-5 text-5xl font-black uppercase tracking-wide sm:text-7xl">Detrás del volante.</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400">
          Descubre a quienes forman la comunidad a través de sus coches y proyectos. Aquí aparecen los perfiles que han publicado al menos un vehículo.
        </p>
        <div className="mt-9 flex flex-wrap items-end justify-between gap-4">
          <form method="get" action="/members" className="flex w-full flex-wrap items-end gap-3 sm:w-auto">
            <label className="min-w-[220px] flex-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
              Busca un alias o un coche
              <input name="q" defaultValue={q} maxLength={40} placeholder="Prelude, E30, tu_alias…"
                className="mt-2 w-full rounded-xl border border-white/15 bg-zinc-900 px-4 py-3 text-base text-white outline-none focus:border-orange-500" />
            </label>
            <button className="rounded-xl bg-orange-500 px-6 py-3.5 text-xs font-black uppercase text-black">Buscar</button>
            {q ? <Link href="/members" className="rounded-xl border border-white/15 px-4 py-3 text-xs uppercase text-zinc-300">Limpiar</Link> : null}
          </form>
          <Link href="/garage/new" className="text-xs font-bold uppercase tracking-wider text-orange-400 underline">
            Publica tu coche para aparecer ↗
          </Link>
        </div>
        {unavailable ? (
          <p role="alert" className="mt-10 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
            El directorio no está disponible en este momento. Los eventos y rutas siguen accesibles.
          </p>
        ) : members.length ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <Link href={"/members/" + encodeURIComponent(member.username)} key={member.username}
                className="group rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-6 transition hover:border-orange-500/50">
                <div className="flex items-center gap-4">
                  <div aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-2xl font-black text-orange-400">
                    {member.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-black">@{member.username}</h2>
                    <p className="mt-1 text-xs text-zinc-500">
                      {member._count.cars} {member._count.cars === 1 ? "vehículo" : "vehículos"}
                      {member.location ? " · " + member.location : ""}
                    </p>
                  </div>
                </div>
                {member.bio ? <p className="mt-5 line-clamp-2 text-sm leading-6 text-zinc-400">{member.bio}</p> : null}
                <div className="mt-6 min-h-12 border-t border-white/10 pt-4 text-sm text-zinc-300">
                  {member.cars.map((car) => <p key={car.make + car.model + car.year} className="truncate">
                    {car.make} {car.model} · {car.year}
                  </p>)}
                </div>
                <span className="mt-5 inline-flex text-xs font-black uppercase tracking-wider text-orange-400">Ver su garaje ↗</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-white/10 p-10 text-center">
            <h2 className="text-2xl font-black uppercase">{q ? "No hay coincidencias." : "Sé quien abra el camino."}</h2>
            <p className="mt-3 text-sm text-zinc-400">{q ? "Prueba con otro alias o marca." : "Publica tu primer vehículo y únete al directorio."}</p>
            <Link href="/garage" className="mt-5 inline-flex text-sm text-orange-400 underline">Explorar Garage</Link>
          </div>
        )}
      </div>
    </main>
  );
}
