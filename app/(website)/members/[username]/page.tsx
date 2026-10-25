import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { socialEnabled } from "@/app/lib/community-social";
import FollowButton from "@/components/community/FollowButton";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import CarCard from "@/components/garage/CarCard";
import { buildPremiumMetadata } from "@/app/lib/seo";

type Props = { params: Promise<{ username: string }> };
export const dynamic = "force-dynamic";

async function findMember(username: string) {
  try {
    return await prisma.user.findUnique({
      where: { username },
      select: {
        id: true, username: true, name: true, bio: true, location: true,
        _count: { select: { followers: true, following: true } },
        cars: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true, make: true, model: true, year: true, imageUrl: true,
            owner: { select: { username: true, name: true } },
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const member = await findMember(username);
  return member ? buildPremiumMetadata({
    title: "@" + member.username + " | Garaje Tramassso",
    description: "Descubre los coches de @" + member.username + " en la comunidad Tramassso.",
    path: "/members/" + encodeURIComponent(member.username),
  }) : { title: "Perfil no encontrado" };
}

export default async function MemberPage({ params }: Props) {
  const { username } = await params;
  const member = await findMember(username);
  if (!member) notFound();
  const session = await getServerSession(authOptions);
  const enabled = socialEnabled();
  const isSelf = session?.user?.id === member.id;
  const following = enabled && session?.user?.id && !isSelf
    ? Boolean(await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: session.user.id, followingId: member.id } },
        select: { id: true },
      }))
    : false;
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-14 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500">Tramassso / Miembros</p>
        <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/60 to-black p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-5">
            <div aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-3xl font-black text-black">{member.username.slice(0, 1).toUpperCase()}</div>
            <div><h1 className="text-3xl font-black uppercase sm:text-5xl">@{member.username}</h1><p className="mt-2 text-zinc-400">{member.name || "Miembro de Tramassso"}</p></div>
          </div>
          {member.bio ? <p className="mt-6 max-w-2xl whitespace-pre-line text-sm leading-7 text-zinc-400">{member.bio}</p> : null}
          {enabled ? <div className="mt-6 flex flex-wrap items-center gap-4">
            <FollowButton username={member.username} initialFollowing={following} signedIn={Boolean(session?.user?.id)} isSelf={isSelf} />
            <p className="text-xs uppercase tracking-wider text-zinc-400">{member._count.followers} seguidores · {member._count.following} siguiendo</p>
          </div> : null}
          {member.location ? <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-400">📍 {member.location}</p> : null}
          <p className="mt-6 text-xs uppercase tracking-widest text-orange-500">{member.cars.length} coches en su garage</p>
        </div>
        <h2 className="mt-12 text-2xl font-black uppercase tracking-wider">Sus proyectos</h2>
        {member.cars.length ? <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{member.cars.map((car) => <CarCard key={car.id} car={car} />)}</div> :
          <p className="mt-6 rounded-2xl border border-white/10 p-8 text-sm text-zinc-500">Aun no hay vehiculos publicados en este perfil.</p>}
        <div className="mt-8 flex flex-wrap gap-6 text-sm"><Link href="/garage" className="font-semibold text-orange-500 underline">Explorar mas proyectos →</Link><Link href="/community" className="font-semibold text-orange-500 underline">Ver la comunidad →</Link></div>
      </div>
    </main>
  );
}
