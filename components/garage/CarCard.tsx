import Link from "next/link";
import Image from "next/image";
import TramasssoIcon from "@/components/ui/TramasssoIcon";
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
    <Link href={"/garage/" + car.id}
      className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#101113] transition-colors hover:border-orange-500/50 focus-visible:outline-orange-500">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#222123] to-[#0a0a0c]">
        {image ? (
          <Image src={image} alt={car.make + " " + car.model} fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 bg-[radial-gradient(circle,rgba(255,106,0,.09),transparent_65%)]">
            <TramasssoIcon name="garage" size="lg" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Tramassso Garage</span>
          </div>
        )}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
        <span className="trm-pill absolute bottom-4 left-4 border-white/10 bg-black/75 text-orange-300">{car.year}</span>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <p className="trm-kicker">Proyecto de la comunidad</p>
          <h3 className="trm-card-title mt-2 text-xl leading-tight">{car.make} {car.model}</h3>
          <p className="mt-2 truncate text-xs text-zinc-500">por @{car.owner.username}</p>
        </div>
        <span className="trm-icon-frame h-10 w-10 shrink-0 rounded-xl transition-colors group-hover:border-orange-500/60">
          <TramasssoIcon name="arrow" frame={false} size="sm" />
        </span>
      </div>
    </Link>
  );
}
