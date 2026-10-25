import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { authOptions } from "@/app/lib/auth";
import CarForm from "@/components/garage/CarForm";

export const metadata: Metadata = { title: "Añadir coche", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewCarPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=%2Fgarage%2Fnew");
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-14 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500">Tramassso / Mi garage</p>
        <h1 className="mt-4 text-4xl font-black uppercase">Publica tu proyecto.</h1>
        <p className="mb-9 mt-4 text-sm text-zinc-400">Una ficha publica que podras compartir con quien quieras. No publiques matriculas, datos privados ni ubicaciones sensibles.</p>
        <CarForm />
      </div>
    </main>
  );
}
