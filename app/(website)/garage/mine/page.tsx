import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import CarCard from "@/components/garage/CarCard";
import MemberPass from "@/components/clubs/MemberPass";

export const metadata: Metadata = { title: "Mi garaje", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function MyGaragePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=%2Fgarage%2Fmine");
  const [cars, memberships, ownedClubs] = await Promise.all([
    prisma.car.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { owner: { select: { username: true, name: true } } },
    }),
    prisma.clubMember.findMany({
      where: { userId: session.user.id, status: "approved" },
      orderBy: { joinedAt: "asc" },
      select: {
        id: true, joinedAt: true,
        club: { select: { id: true, name: true, category: true, location: true } },
      },
    }),
    prisma.club.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    }),
  ]);
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-14 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500">Area personal</p>
        <h1 className="mt-4 text-5xl font-black uppercase">Mi garaje</h1>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/garage/new" className="rounded-xl bg-orange-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-black">+ Añadir coche</Link>
          <Link href={"/members/" + encodeURIComponent(session.user.username)} className="rounded-xl border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white">Ver mi perfil publico</Link>
          <Link href="/clubs" className="rounded-xl border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white">Explorar clubes</Link>
          <Link href="/account" className="rounded-xl border border-orange-500/50 px-5 py-3 text-xs font-bold uppercase tracking-widest text-orange-400">Editar mi perfil</Link>
        </div>
        {cars.length ?
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{cars.map((car) => <CarCard key={car.id} car={car} />)}</div> :
          <p className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-10 text-zinc-400">Aun no tienes coches. Empieza publicando tu primer proyecto.</p>}

        <section aria-labelledby="my-clubs" className="mt-16 border-t border-white/10 pt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500">Tramassso / Clubs</p>
              <h2 id="my-clubs" className="mt-3 text-3xl font-black uppercase">Mis clubes y carnets</h2>
              <p className="mt-3 text-sm text-zinc-400">Tus acreditaciones digitales se muestran solo en tu espacio personal.</p>
            </div>
            <Link href="/clubs/new" className="rounded-xl border border-orange-500/60 px-5 py-3 text-xs font-bold uppercase tracking-wider text-orange-400">Crear un club</Link>
          </div>
          {memberships.length ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {memberships.map((membership) => <MemberPass key={membership.id} membership={membership} username={session.user.username} />)}
            </div>
          ) : <p className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400">Aun no perteneces a ningún club aprobado. Encuentra un grupo y solicita unirte gratuitamente.</p>}
          {ownedClubs.length ? (
            <div className="mt-8 rounded-2xl border border-white/10 p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Clubes que administras</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {ownedClubs.map((club) => <Link key={club.id} href={"/clubs/" + club.id + "/manage"} className="rounded-xl border border-white/20 px-4 py-3 text-sm text-orange-400 hover:border-orange-500">{club.name} ↗</Link>)}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
