import Link from "next/link";
import Image from "next/image";
import { safeCarImage } from "@/app/lib/community";

type CarCardData = {
  id: string;
  make: string;
  model: string;
  year: number;
  imageUrl: string | null;
  owner: { username: string; name: string | null };
};

export default function CarCard({ car }: { car: CarCardData }) {
  const image = safeCarImage(car.imageUrl);
  return (
    <Link href={"/garage/" + car.id} className="group block overflow-hidden rounded-[1.5rem] border border-white/10 bg-zinc-900/60 transition hover:-translate-y-1 hover:border-orange-500/50">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-zinc-800 to-black">
        {image ? <Image src={image} alt={car.make + " " + car.model} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" /> :
          <div className="flex h-full items-center justify-center text-5xl font-black tracking-widest text-white/15">TRM.</div>}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
        <span className="absolute bottom-4 left-5 text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500">Garage / {car.year}</span>
      </div>
      <div className="flex items-center justify-between gap-3 p-5">
        <div>
          <h3 className="text-lg font-black uppercase tracking-wide text-white">{car.make} {car.model}</h3>
          <p className="mt-1 text-xs text-zinc-500">por @{car.owner.username}</p>
        </div>
        <span aria-hidden="true" className="text-xl text-orange-500">↗</span>
      </div>
    </Link>
  );
}
