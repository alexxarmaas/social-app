import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { authOptions } from "@/app/lib/auth";
import { safeCarImage } from "@/app/lib/community";
import { publicCar } from "@/app/lib/community-data";
import { buildPremiumMetadata, metadataBase } from "@/app/lib/seo";
import { CarShareButton } from "@/components/garage/CarShareButton";

type Props = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const car = await publicCar(id);
  if (!car) return { title: "Coche no encontrado" };
  return buildPremiumMetadata({
    title: car.make + " " + car.model + " (" + car.year + ")",
    description: "Descubre este proyecto de @" + car.owner.username + " en el Garage de Tramassso.",
    path: "/garage/" + car.id,
    image: new URL("/garage/" + car.id + "/opengraph-image", metadataBase).toString(),
    type: "article",
  });
}

export default async function CarDetailsPage({ params }: Props) {
  const { id } = await params;
  const [car, session] = await Promise.all([publicCar(id), getServerSession(authOptions)]);
  if (!car) notFound();
  const image = safeCarImage(car.imageUrl);
  const mine = session?.user?.id === car.ownerId;
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12 text-white">
      <article className="mx-auto max-w-6xl">
        <Link href="/garage" className="text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-orange-500">← Volver al garage</Link>
        <div className="mt-7 grid overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/40 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative min-h-[320px] bg-gradient-to-br from-zinc-800 to-black lg:min-h-[580px]">
            {image ? <Image src={image} alt={car.make + " " + car.model} fill priority sizes="(max-width: 1024px) 100vw, 65vw" className="object-cover" /> :
              <div className="flex h-full min-h-[320px] items-center justify-center text-7xl font-black text-white/10">TRM.</div>}
          </div>
          <div className="flex flex-col justify-between gap-12 p-6 sm:p-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500">Tramassso / Garage</p>
              <h1 className="mt-5 text-4xl font-black uppercase leading-tight tracking-wide sm:text-5xl">{car.make} {car.model}</h1>
              <p className="mt-4 text-sm text-zinc-400">Proyecto de <Link className="font-bold text-white underline" href={"/members/" + encodeURIComponent(car.owner.username)}>@{car.owner.username}</Link></p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[["Año", String(car.year)], ["Potencia", car.horsepower ? String(car.horsepower) + " CV" : "—"], ["Motor", car.engine || "—"], ["Color", car.color || "—"]].map(([label, value]) =>
                  <div key={label} className="rounded-xl border border-white/10 bg-black/30 p-4"><p className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</p><p className="mt-2 font-semibold text-white">{value}</p></div>)}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <CarShareButton title={car.make + " " + car.model} />
              <a href={"/garage/" + car.id + "/opengraph-image"} download={"tramassso-" + car.id.slice(0, 8) + ".png"} className="rounded-xl border border-orange-500/50 px-5 py-3 text-xs font-bold uppercase tracking-widest text-orange-400 hover:border-orange-400">Guardar tarjeta</a>
              {mine ? <Link href={"/garage/" + car.id + "/edit"} className="rounded-xl border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-widest">Editar mi ficha</Link> : null}
            </div>
          </div>
        </div>
        {car.description || car.modifications ? <div className="mt-9 grid gap-5 md:grid-cols-2">
          {car.description ? <section className="rounded-3xl border border-white/10 p-6 sm:p-8"><h2 className="text-xl font-black uppercase">La historia</h2><p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-400">{car.description}</p></section> : null}
          {car.modifications ? <section className="rounded-3xl border border-white/10 p-6 sm:p-8"><h2 className="text-xl font-black uppercase">Modificaciones</h2><p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-400">{car.modifications}</p></section> : null}
        </div> : null}
      </article>
    </main>
  );
}
