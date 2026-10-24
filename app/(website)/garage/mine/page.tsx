import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import CarCard from "@/components/garage/CarCard";

export const metadata: Metadata = { title: "Mi garaje", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function MyGaragePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=%2Fgarage%2Fmine");
  const cars = await prisma.car.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { username: true, name: true } } },
  });
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-14 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500">Area personal</p>
        <h1 className="mt-4 text-5xl font-black uppercase">Mi garaje</h1>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/garage/new" className="rounded-xl bg-orange-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-black">+ Añadir coche</Link>
          <Link href={"/members/" + encodeURIComponent(session.user.username)} className="rounded-xl border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white">Ver mi perfil publico</Link>
        </div>
        {cars.length ?
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{cars.map((car) => <CarCard key={car.id} car={car} />)}</div> :
          <p className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-10 text-zinc-400">Aun no tienes coches. Empieza publicando tu primer proyecto.</p>}
      </div>
    </main>
  );
}
