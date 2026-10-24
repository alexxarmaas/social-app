import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/app/lib/prisma";
import { buildPremiumMetadata } from "@/app/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPremiumMetadata({
  title: "Clubes de motor",
  description: "Encuentra clubes de coches, solicita unirte a tu grupo y crea tu propia comunidad gratuita en Tramassso.",
  path: "/clubs",
});

export default async function ClubsPage() {
  let clubs: { id: string; name: string; description: string | null; location: string | null; category: string; _count: { members: number } }[] = [];
  try {
    clubs = await prisma.club.findMany({
      take: 40,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, description: true, location: true, category: true,
        _count: { select: { members: { where: { status: "approved" } } } },
      },
    });
  } catch (error) { console.error("Clubs list unavailable", error); }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-14 text-white sm:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500">Tramassso / Clubs</p>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <div><h1 className="text-5xl font-black uppercase tracking-wide sm:text-7xl">Mas que un grupo.</h1><p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400">Descubre clubes de motor, conecta con gente que comparte tu aficion o crea el tuyo. Todo gratuito.</p></div>
          <Link href="/clubs/new" className="rounded-xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-black">+ Crear un club</Link>
        </div>
        {clubs.length ? <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {clubs.map((club) => <Link key={club.id} href={"/clubs/" + club.id} className="group rounded-3xl border border-white/10 bg-zinc-900/50 p-7 transition hover:border-orange-500/40">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-500">{club.category}</span>
            <h2 className="mt-5 text-2xl font-black uppercase">{club.name}</h2>
            <p className="mt-3 line-clamp-3 min-h-12 text-sm leading-6 text-zinc-400">{club.description || "Club de la comunidad Tramassso."}</p>
            <p className="mt-7 border-t border-white/10 pt-5 text-xs text-zinc-500">{club.location || "Sin ubicacion"} · {club._count.members} miembros</p>
          </Link>)}
        </div> : <div className="mt-12 rounded-3xl border border-white/10 bg-zinc-900/30 p-12 text-center">
          <h2 className="text-3xl font-black uppercase">Tu club puede ser el primero.</h2><p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-zinc-400">Todavia no hay clubes publicados, o la base de datos no esta disponible. Abre tu comunidad gratis.</p>
          <Link href="/clubs/new" className="mt-7 inline-flex rounded-xl border border-orange-500 px-6 py-3 text-xs font-bold uppercase text-orange-500">Crear mi club</Link>
        </div>}
      </div>
    </main>
  );
}
