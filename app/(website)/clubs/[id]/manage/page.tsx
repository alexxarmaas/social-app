import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import ApplicationsPanel from "@/components/clubs/ApplicationsPanel";

type Props = { params: Promise<{ id: string }> };
export const metadata: Metadata = { title: "Gestionar club", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ClubManagePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  if (!session?.user?.id) redirect("/login?next=%2Fclubs");
  const club = await prisma.club.findFirst({
    where: { id, ownerId: session.user.id },
    select: {
      id: true, name: true,
      members: {
        where: { status: "pending" },
        orderBy: { joinedAt: "asc" },
        select: { id: true, user: { select: { username: true, name: true } } },
      },
    },
  });
  if (!club) notFound();
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-14 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href={"/clubs/" + club.id} className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-lime-300">← Volver al club</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.3em] text-lime-300">Administracion de club</p>
        <h1 className="mt-4 text-4xl font-black uppercase">{club.name}</h1>
        <p className="mt-4 text-sm text-zinc-400">Revisa las solicitudes de ingreso. Solo el responsable del club puede aceptar o rechazar nuevos miembros.</p>
        <ApplicationsPanel clubId={club.id} initial={club.members} />
      </div>
    </main>
  );
}
