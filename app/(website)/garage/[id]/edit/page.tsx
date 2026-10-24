import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import CarForm from "@/components/garage/CarForm";

type Props = { params: Promise<{ id: string }> };
export const metadata: Metadata = { title: "Editar mi coche", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EditCarPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  if (!session?.user?.id) redirect("/login?next=%2Fgarage%2Fmine");
  const car = await prisma.car.findFirst({ where: { id, ownerId: session.user.id } });
  if (!car) notFound();
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-14 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500">Garage / Edicion</p>
        <h1 className="mb-9 mt-4 text-4xl font-black uppercase">Actualiza tu coche.</h1>
        <CarForm carId={car.id} initial={{
          make: car.make, model: car.model, year: car.year,
          color: car.color || "", engine: car.engine || "",
          horsepower: car.horsepower, modifications: car.modifications || "",
          description: car.description || "", imageUrl: car.imageUrl || "",
        }} />
      </div>
    </main>
  );
}
