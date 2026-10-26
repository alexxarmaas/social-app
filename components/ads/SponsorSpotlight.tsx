import Link from "next/link";
import TramasssoIcon from "@/components/ui/TramasssoIcon";
import { listPublicPartners } from "@/app/lib/tramassso-content";
import PartnerLogo from "@/components/partners/PartnerLogo";
import TrackSponsorClick from "@/components/TrackSponsorClick";

/** Public featured partner selected through the existing Supabase admin. */
export default async function SponsorSpotlight({ placement }: { placement: "home" | "garage" | "clubs" }) {
  const { partners } = await listPublicPartners();
  const partner = partners.find((item) => item.is_featured);
  if (!partner) return null;
  const destination = partner.website_url || partner.instagram_url;
  return (
    <aside aria-label="Colaborador destacado" className="trm-surface mt-12 overflow-hidden p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="trm-pill"><TramasssoIcon name="partners" frame={false} size="sm" /> Colaborador destacado</span>
        <Link href="/anunciarse" className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-orange-300">
          ¿Quieres anunciarte? <TramasssoIcon name="arrow" frame={false} size="sm" />
        </Link>
      </div>
      <div className="mt-6 flex min-w-0 flex-wrap items-center gap-5 md:flex-nowrap">
        <PartnerLogo src={partner.logo_url} alt={"Logo de " + partner.name} variant="thumbnail" />
        <div className="min-w-[170px] flex-1">
          <h3 className="trm-card-title text-xl leading-tight">{partner.name}</h3>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-orange-400">{partner.category}</p>
          {partner.description ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">{partner.description}</p> : null}
        </div>
        {destination ? (
          <TrackSponsorClick sponsorName={partner.name} websiteUrl={destination} placement={placement}
            className="trm-action w-full md:w-auto">
            Visitar colaborador <TramasssoIcon name="arrow" size="sm" frame={false} />
          </TrackSponsorClick>
        ) : (
          <Link href={"/partners/" + partner.id} className="trm-action-secondary w-full md:w-auto">
            Ver colaborador <TramasssoIcon name="arrow" frame={false} size="sm" />
          </Link>
        )}
      </div>
    </aside>
  );
}
