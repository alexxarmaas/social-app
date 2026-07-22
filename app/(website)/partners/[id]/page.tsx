import type { Metadata } from "next";
import Link from "next/link";
import TrackSponsorClick from "@/components/TrackSponsorClick";
import PartnerLogo from "@/components/partners/PartnerLogo";
import { notFound } from "next/navigation";
import { getPublicPartner } from "@/app/lib/tramassso-content";
import { listPublicPartnerServices } from "@/app/lib/partner-services";
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
  const [{ partner }, { services }] = await Promise.all([
    getPublicPartner(id),
    listPublicPartnerServices(id),
  ]);

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
    makesOffer: services.length
      ? services.map((service) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service.name,
            description: service.description ?? undefined,
          },
        }))
      : undefined,
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

        {services.length ? (
          <section className="mt-2 rounded-[1.5rem] border border-zinc-800 bg-black/25 p-4 sm:rounded-[2rem] sm:p-6 lg:p-8" aria-labelledby="partner-services-title">
            <div className="max-w-2xl">
              <p className="racing-eyebrow text-[9px] uppercase tracking-[0.4em] text-red-300 sm:text-[10px] sm:tracking-[0.45em]">Servicios</p>
              <h2 id="partner-services-title" className="mt-3 text-balance text-xl font-black uppercase tracking-[0.05em] text-white sm:text-2xl lg:text-3xl">
                Qué ofrece {partner.name}
              </h2>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:gap-4">
              {services.map((service, index) => (
                <article key={service.id} className="group relative min-w-0 overflow-hidden rounded-[1.25rem] border border-zinc-800 bg-zinc-950/80 p-4 transition hover:border-red-500/40 sm:p-5">
                  <div className="absolute right-4 top-3 font-aeroblade text-3xl text-zinc-900 transition group-hover:text-red-950 sm:text-4xl" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 className="relative pr-12 text-sm font-semibold uppercase tracking-[0.08em] text-zinc-100 sm:text-base">{service.name}</h3>
                  {service.description ? (
                    <p className="relative mt-3 text-sm leading-6 text-zinc-400">{service.description}</p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

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
