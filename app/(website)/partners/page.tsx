import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TrackSponsorClick from "@/components/TrackSponsorClick";
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
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-50">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-5 sm:py-14 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <p className="racing-eyebrow text-xs uppercase tracking-[0.45em] text-zinc-500">Colaboradores</p>
          <h1 className="text-balance text-3xl font-black uppercase tracking-[0.06em] text-white sm:text-4xl sm:tracking-[0.1em] md:text-6xl">Marcas en pista</h1>
          <p className="max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">Colaboradores seleccionados para rutas, eventos y activaciones.</p>
        </div>

        {partners.length ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {partners.map((partner) => (
              <article key={partner.id} className="racing-card flex min-h-[22rem] min-w-0 flex-col rounded-[1.5rem] border p-4 sm:rounded-[2rem] sm:p-5">
                <div className="grid gap-3 sm:flex sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-[10px] uppercase tracking-[0.24em] text-zinc-500 sm:tracking-[0.35em]">{partner.category}</p>
                    <h2 className="mt-3 break-words font-sans text-xl font-semibold tracking-tight text-white sm:text-2xl">{partner.name}</h2>
                  </div>
                  {partner.is_featured ? (
                    <span className="w-fit rounded-full border border-red-500/35 bg-red-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-red-100 sm:tracking-[0.25em]">
                      Destacado
                    </span>
                  ) : null}
                </div>

                <div className="mt-6 flex h-28 items-center justify-center rounded-[1.5rem] border border-zinc-800 bg-black/30">
                  {partner.logo_url ? (
                    <Image src={partner.logo_url} alt={partner.name} width={220} height={96} className="max-h-20 w-auto max-w-[80%] object-contain" />
                  ) : (
                    <span className="font-aeroblade text-3xl tracking-[0.18em] text-zinc-700">Tramassso</span>
                  )}
                </div>

                <p className="mt-5 line-clamp-4 flex-1 text-sm leading-7 text-zinc-400">
                  {partner.description ?? "Colaborador seleccionado de la comunidad Tramassso."}
                </p>

                <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
                  <Link href={`/partners/${partner.id}`} className="racing-button inline-flex w-full justify-center rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] transition sm:w-fit sm:tracking-[0.32em]">
                    Ver perfil
                  </Link>
                  {partner.website_url ? (
                    <TrackSponsorClick sponsorName={partner.name} websiteUrl={partner.website_url} className="inline-flex w-full justify-center rounded-full border border-zinc-800 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-300 transition hover:border-red-500/60 hover:text-white sm:w-fit sm:tracking-[0.32em]">
                      Visitar web
                    </TrackSponsorClick>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="racing-panel mt-10 rounded-[2rem] p-10 text-center">
            <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Colaboradores en seleccion</p>
            <p className="mt-3 text-sm text-zinc-400">Pronto agregaremos nuevas marcas.</p>
          </div>
        )}
      </section>
    </main>
  );
}
