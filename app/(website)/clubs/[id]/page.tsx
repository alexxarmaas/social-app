import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import MembershipButton from "@/components/clubs/MembershipButton";
import { buildPremiumMetadata } from "@/app/lib/seo";

type Props = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";

async function getClub(id: string) {
  try {
    return await prisma.club.findUnique({
      where: { id },
      select: {
        id: true, name: true, description: true, category: true, location: true, ownerId: true,
        _count: { select: { members: { where: { status: "approved" } } } },
      },
    });
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const club = await getClub(id);
  return club ? buildPremiumMetadata({
    title: club.name + " | Clubs",
    description: (club.description || "Club de motor en Tramassso.").slice(0, 160),
    path: "/clubs/" + club.id,
  }) : { title: "Club no encontrado" };
}

export default async function ClubPage({ params }: Props) {
  const { id } = await params;
  const [club, session] = await Promise.all([getClub(id), getServerSession(authOptions)]);
  if (!club) notFound();
  const isOwner = Boolean(session?.user?.id && club.ownerId === session.user.id);
  const membership = session?.user?.id && !isOwner
    ? await prisma.clubMember.findUnique({ where: { userId_clubId: { userId: session.user.id, clubId: club.id } }, select: { status: true } })
    : null;
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-14 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/clubs" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-lime-300">← Ver todos los clubes</Link>
        <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/70 via-zinc-900 to-black p-8 sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-lime-300">Tramassso / {club.category}</p>
          <h1 className="mt-6 break-words text-4xl font-black uppercase tracking-wide sm:text-6xl">{club.name}</h1>
          <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-wider text-zinc-400">
            <span className="rounded-lg border border-white/10 px-4 py-2">{club.location || "Comunidad del motor"}</span>
            <span className="rounded-lg border border-white/10 px-4 py-2">{club._count.members} miembros</span>
          </div>
          {club.description ? <p className="mt-9 max-w-2xl whitespace-pre-wrap text-sm leading-8 text-zinc-300">{club.description}</p> : null}
          <div className="mt-9">
            {isOwner ? <Link href={"/clubs/" + club.id + "/manage"} className="inline-flex rounded-xl bg-lime-300 px-6 py-3 text-xs font-black uppercase text-black">Gestionar solicitudes ↗</Link> :
              <MembershipButton clubId={club.id} signedIn={Boolean(session?.user?.id)} initialStatus={membership?.status || "none"} />}
          </div>
        </div>
        <p className="mt-7 text-sm text-zinc-500">Las solicitudes de ingreso requieren aprobacion del responsable del club. No se muestran datos privados de sus miembros.</p>
      </div>
    </main>
  );
}
