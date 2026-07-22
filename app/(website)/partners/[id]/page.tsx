import type { Metadata } from "next";
import Link from "next/link";
import TrackSponsorClick from "@/components/TrackSponsorClick";
import PartnerLogo from "@/components/partners/PartnerLogo";
import { notFound } from "next/navigation";
import { getPublicPartner } from "@/app/lib/tramassso-content";
import { serializeJsonLd } from "@/app/lib/json-ld";
import { buildPremiumMetadata, luxuryFallbackImage, metadataBase } from "@/app/lib/seo";

export const revalidate = 60;

type PartnerPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PartnerPageProps): Promise<Metadata> {
  const { id } = await params;
  const { partner } = await getPublicPartner(id);

  if (!partner) {
    return buildPremiumMetadata({
      title: "Colaborador Tramassso",
      description: "Colaborador seleccionado de la comunidad Tramassso.",
      path: `/partners/${id}`,
      image: luxuryFallbackImage,
    });
  }

  return buildPremiumMetadata({
    title: partner.name,
    description: `${partner.category} en el directorio de colaboradores Tramassso.`,
    path: `/partners/${partner.id}`,
    image: partner.logo_url,
    type: "article",
  });
}

export default async function PartnerDetailsPage({ params }: PartnerPageProps) {
  const { id } = await params;
  const { partner } = await getPublicPartner(id);

  if (!partner) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: partner.name,
    description: partner.description ?? "Colaborador seleccionado de la comunidad Tramassso.",
    url: partner.website_url ?? new URL(`/partners/${partner.id}`, metadataBase).toString(),
    logo: partner.logo_url ?? undefined,
    memberOf: {
      "@type": "Organization",
      name: "Tramassso",
      url: metadataBase.toString(),
    },
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <PartnerLogo
          src={partner.logo_url}
          alt={`Logo de ${partner.name}`}
          variant="detail"
          className="rounded-[1.25rem] shadow-2xl shadow-black/20"
          priority
        />

        <div className="space-y-4">
          <p className="racing-eyebrow text-[9px] uppercase tracking-[0.4em] text-zinc-500 sm:text-[10px] sm:tracking-[0.45em]">{partner.category}</p>
          <h1 className="text-balance break-words text-2xl font-black uppercase tracking-[0.05em] text-white sm:text-3xl lg:text-4xl">{partner.name}</h1>
          <p className="max-w-3xl text-[13px] leading-6 text-zinc-400 sm:text-sm">
            {partner.description ?? "Colaborador seleccionado de la comunidad Tramassso."}
          </p>
        </div>

        <div className="grid gap-3 sm:flex sm:flex-wrap">
          <Link href="/partners" className="inline-flex justify-center rounded-full border border-zinc-800 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-300 transition hover:border-red-500/60 hover:text-white">
            Volver
          </Link>
          {partner.website_url ? (
            <TrackSponsorClick sponsorName={partner.name} websiteUrl={partner.website_url} className="racing-button inline-flex justify-center rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] transition">
              Visitar web
            </TrackSponsorClick>
          ) : null}
          {partner.instagram_url ? (
            <TrackSponsorClick sponsorName={`${partner.name} · Instagram`} websiteUrl={partner.instagram_url} className="inline-flex justify-center rounded-full border border-zinc-800 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-300 transition hover:border-red-500/60 hover:text-white">
              Instagram
            </TrackSponsorClick>
          ) : null}
        </div>
      </section>
    </main>
  );
}
