import Link from "next/link";
import TramasssoIcon, { type TramasssoIconName } from "@/components/ui/TramasssoIcon";

type Props = {
  href: string;
  number: string;
  category: string;
  title: string;
  description: string;
  action: string;
  icon: TramasssoIconName;
};

export default function DiscoveryCard({ href, number, category, title, description, action, icon }: Props) {
  return (
    <Link href={href} className="trm-discovery-card group flex min-w-0 flex-col p-6 sm:p-7 lg:p-8">
      <div className="flex items-center justify-between">
        <TramasssoIcon name={icon} size="lg" />
        <span className="text-[10px] font-bold tracking-[0.22em] text-zinc-600">{number} / 05</span>
      </div>
      <div className="mt-8 flex min-w-0 flex-1 flex-col">
        <p className="trm-kicker">{category}</p>
        <h3 className="trm-card-title mt-3 text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.12]">
          {title}
        </h3>
        <p className="mt-4 text-sm leading-6 text-zinc-400">{description}</p>
        <span className="mt-auto inline-flex items-center gap-2 pt-7 text-xs font-extrabold uppercase tracking-[0.12em] text-orange-400">
          {action}
          <TramasssoIcon name="arrow" size="sm" frame={false}
            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
