import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import ProfileForm from "@/components/community/ProfileForm";

export const metadata: Metadata = { title: "Editar mi perfil", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=%2Faccount");
  const member = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, email: true, name: true, bio: true, location: true },
  });
  if (!member) notFound();
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-14 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500">Tramassso / Mi cuenta</p>
        <h1 className="mt-4 text-4xl font-black uppercase">Tu perfil. A tu manera.</h1>
        <p className="mt-5 text-sm leading-7 text-zinc-400">Tu nombre, biografia y ubicacion se mostraran en tu perfil. El email se mantiene privado.</p>
        <div className="mt-8 flex flex-wrap gap-3 text-xs text-zinc-400">
          <span className="rounded-xl border border-white/10 px-4 py-2">@{member.username}</span>
          <span className="rounded-xl border border-white/10 px-4 py-2">{member.email}</span>
        </div>
        <ProfileForm initial={{ name: member.name || member.username, bio: member.bio || "", location: member.location || "" }} />
        <Link href={"/members/" + encodeURIComponent(member.username)} className="mt-7 inline-block text-sm text-orange-400 underline">Ver mi perfil publico ↗</Link>
      </div>
    </main>
  );
}
