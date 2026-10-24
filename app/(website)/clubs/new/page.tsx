import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { authOptions } from "@/app/lib/auth";
import ClubForm from "@/components/clubs/ClubForm";

export const metadata: Metadata = { title: "Crear club", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewClubPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=%2Fclubs%2Fnew");
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-14 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500">Tramassso / Clubs</p>
        <h1 className="mt-4 text-4xl font-black uppercase">Crea tu propio club.</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400">Presenta tu grupo al resto de la comunidad y gestiona las solicitudes de miembros desde un panel privado.</p>
        <ClubForm />
      </div>
    </main>
  );
}
