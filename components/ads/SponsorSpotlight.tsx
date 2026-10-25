import Link from "next/link";
import { listPublicPartners } from "@/app/lib/tramassso-content";
import PartnerLogo from "@/components/partners/PartnerLogo";
import TrackSponsorClick from "@/components/TrackSponsorClick";

/**
 * Uses existing Supabase partners controlled in /admin.
 * No fabricated advertisers, impressions or rates: display only featured entries.
 */
export default async function SponsorSpotlight({ placement }: { placement: "home" | "garage" | "clubs" }) {
  const { partners } = await listPublicPartners();
  const partner = partners.find((item) => item.is_featured);
  if (!partner) return null;
  const destination = partner.website_url || partner.instagram_url;
  return (
    <aside aria-label="Colaborador destacado" className="mt-12 rounded-3xl border border-orange-500/20 bg-gradient-to-r from-[#191211] to-[#090909] p-5 text-white sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-orange-400">Colaborador destacado</span>
        <Link href="/anunciarse" className="text-[11px] text-zinc-400 underline hover:text-white">¿Quieres anunciarte?</Link>
      </div>
      <div className="flex flex-wrap items-center gap-5 sm:flex-nowrap">
        <PartnerLogo src={partner.logo_url} alt={"Logo de " + partner.name} variant="thumbnail" />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black uppercase">{partner.name}</h3>
          <p className="mt-1 text-sm text-zinc-400">{partner.category}</p>
          {partner.description ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">{partner.description}</p> : null}
        </div>
        {destination ? (
          <TrackSponsorClick sponsorName={partner.name} websiteUrl={destination} placement={placement} className="inline-flex shrink-0 items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-xs font-bold uppercase tracking-wide text-black transition hover:bg-orange-400">
            Visitar colaborador ↗
          </TrackSponsorClick>
        ) : (
          <Link href={"/partners/" + partner.id} className="inline-flex shrink-0 items-center justify-center rounded-xl border border-orange-500/40 px-5 py-3 text-xs font-bold uppercase text-orange-400">Ver perfil ↗</Link>
        )}
      </div>
    </aside>
  );
}
