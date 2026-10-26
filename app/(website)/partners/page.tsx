import type { Metadata } from "next";
import Link from "next/link";
import TramasssoIcon from "@/components/ui/TramasssoIcon";
import TrackSponsorClick from "@/components/TrackSponsorClick";
import PartnerLogo from "@/components/partners/PartnerLogo";
import { listPublicPartners } from "@/app/lib/tramassso-content";
import { buildPremiumMetadata } from "@/app/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = buildPremiumMetadata({
  title: "Colaboradores Tramassso",
  description: "Marcas y negocios colaboradores de Tramassso.",
  path: "/partners",
  image: null,
});

export default async function PartnersPage() {
  const { partners } = await listPublicPartners();

  return (
    <main className="min-h-screen bg-[#08090a] text-white">
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-5 sm:pt-16 lg:px-8">
        <span className="trm-pill"><TramasssoIcon name="partners" size="sm" frame={false} /> Tramassso / Colaboradores</span>
        <h1 className="mt-5 font-sans text-[clamp(2.7rem,5.8vw,4.8rem)] font-black uppercase leading-[1.04] tracking-[-0.05em]">Marcas que suman.</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
          Talleres, recambios y proyectos del motor que apuestan por esta comunidad.
        </p>
        {partners.length ? (
          <div className="mt-10 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
            {partners.map((partner) => (
              <article key={partner.id} className="trm-surface flex min-w-0 flex-col p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <TramasssoIcon name="partners" size="md" />
                  {partner.is_featured ? (
                    <span className="trm-pill">
                      <TramasssoIcon name="star" size="sm" frame={false} /> Destacado
                    </span>
                  ) : null}
                </div>
                <p className="trm-kicker mt-6">{partner.category}</p>
                <h2 className="trm-card-title mt-3 text-2xl leading-tight">{partner.name}</h2>
                <PartnerLogo src={partner.logo_url} alt={"Logo de " + partner.name} className="mt-6" />
                <p className="mt-6 line-clamp-4 flex-1 text-sm leading-7 text-zinc-400">
                  {partner.description ?? "Colaborador de la comunidad Tramassso."}
                </p>
                <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-6">
                  <Link href={"/partners/" + partner.id} className="trm-action-secondary w-full sm:w-auto">
                    Ver perfil <TramasssoIcon name="arrow" frame={false} size="sm" />
                  </Link>
                  {partner.website_url ? (
                    <TrackSponsorClick sponsorName={partner.name} websiteUrl={partner.website_url}
                      className="trm-action-secondary w-full sm:w-auto">
                      Visitar web <TramasssoIcon name="arrow" frame={false} size="sm" />
                    </TrackSponsorClick>
                  ) : null}
                  {partner.instagram_url ? (
                    <TrackSponsorClick sponsorName={partner.name + " · Instagram"} websiteUrl={partner.instagram_url}
                      className="trm-action-secondary w-full sm:w-auto">
                      <TramasssoIcon name="instagram" frame={false} size="sm" /> Instagram
                    </TrackSponsorClick>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="trm-surface mt-10 flex flex-col items-center p-10 text-center">
            <TramasssoIcon name="partners" size="lg" />
            <h2 className="mt-5 font-sans text-2xl font-black uppercase">Colaboradores en selección.</h2>
            <p className="mt-3 text-sm text-zinc-400">Pronto anunciaremos nuevas marcas.</p>
          </div>
        )}
        <div className="trm-surface mt-10 flex flex-wrap items-center justify-between gap-5 p-7">
          <div>
            <p className="trm-kicker">¿Tienes un negocio del motor?</p>
            <h2 className="mt-3 font-sans text-2xl font-black uppercase tracking-tight">Pon tu marca en marcha.</h2>
          </div>
          <Link href="/anunciarse" className="trm-action">
            Colaborar con Tramassso <TramasssoIcon name="arrow" frame={false} size="sm" />
          </Link>
        </div>
      </section>
    </main>
  );
}
