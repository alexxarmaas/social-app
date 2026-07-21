import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TrackSponsorClick from "@/components/TrackSponsorClick";
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
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-5 sm:py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <div className="racing-panel rounded-[1.5rem] p-5 sm:rounded-[2rem] sm:p-6">
            <div className="flex min-h-72 items-center justify-center rounded-[1.25rem] border border-zinc-800 bg-black/40 p-8 sm:rounded-[1.6rem]">
              {partner.logo_url ? (
                <Image src={partner.logo_url} alt={partner.name} width={420} height={220} className="max-h-52 w-auto max-w-full object-contain" priority />
              ) : (
                <span className="font-aeroblade text-4xl tracking-[0.18em] text-zinc-700 sm:text-5xl">Tramassso</span>
              )}
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            <div className="space-y-4">
              <p className="racing-eyebrow text-[10px] uppercase tracking-[0.35em] text-zinc-500 sm:tracking-[0.45em]">{partner.category}</p>
              <h1 className="text-balance break-words text-4xl font-black uppercase tracking-[0.05em] text-white sm:text-5xl sm:tracking-[0.08em] md:text-7xl">{partner.name}</h1>
              <p className="max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
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
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
