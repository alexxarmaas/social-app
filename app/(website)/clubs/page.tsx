import Link from "next/link";
import TramasssoIcon from "@/components/ui/TramasssoIcon";
import SponsorSpotlight from "@/components/ads/SponsorSpotlight";
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
    <main className="min-h-screen bg-[#08090a] px-4 pb-20 pt-12 text-white sm:pt-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-7">
          <div className="max-w-3xl">
            <span className="trm-pill"><TramasssoIcon name="clubs" size="sm" frame={false} /> Tramassso / Clubes</span>
            <h1 className="mt-5 font-sans text-[clamp(2.7rem,5.8vw,4.8rem)] font-black uppercase leading-[1.04] tracking-[-0.05em]">Más que un grupo.</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
              Descubre clubes de motor, comparte afición y conoce a gente con la misma pasión. Gratis y sin barreras.
            </p>
          </div>
          <Link href="/clubs/new" className="trm-action">
            <TramasssoIcon name="plus" frame={false} size="sm" /> Crear un club
          </Link>
        </div>
        <div className="mt-11 flex items-center justify-between gap-4">
          <p className="trm-kicker">Clubes de la comunidad</p>
          <span className="text-xs text-zinc-500">{clubs.length} {clubs.length === 1 ? "club" : "clubes"}</span>
        </div>
        {clubs.length ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {clubs.map((club) => (
              <Link key={club.id} href={"/clubs/" + club.id}
                className="trm-discovery-card group flex min-w-0 flex-col p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <TramasssoIcon name="clubs" size="lg" />
                  <span className="trm-pill max-w-[60%] truncate">{club.category}</span>
                </div>
                <h2 className="trm-card-title mt-7 text-[1.55rem] leading-tight">{club.name}</h2>
                <p className="mt-4 line-clamp-3 text-sm leading-7 text-zinc-400">
                  {club.description || "Un club de motor que forma parte de Tramassso."}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-6 text-xs text-zinc-400">
                  <span className="inline-flex items-center gap-2">
                    <TramasssoIcon name="location" size="sm" frame={false} className="text-orange-400" />
                    {club.location || "Gran Canaria"}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <TramasssoIcon name="members" size="sm" frame={false} className="text-orange-400" />
                    {club._count.members} {club._count.members === 1 ? "miembro" : "miembros"}
                  </span>
                </div>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-orange-400">
                  Conocer el club <TramasssoIcon name="arrow" frame={false} size="sm" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="trm-surface mt-6 flex flex-col items-center p-12 text-center">
            <TramasssoIcon name="clubs" size="lg" />
            <h2 className="mt-5 font-sans text-2xl font-black uppercase">Tu club puede ser el primero.</h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-zinc-400">Todavía no hay clubes publicados. Crea un grupo y encuentra a tu gente.</p>
            <Link href="/clubs/new" className="trm-action mt-6">
              Crear mi club <TramasssoIcon name="arrow" size="sm" frame={false} />
            </Link>
          </div>
        )}
        <SponsorSpotlight placement="clubs" />
      </div>
    </main>
  );
}
