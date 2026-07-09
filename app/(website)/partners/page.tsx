import type { Metadata } from "next";
import Image from "next/image";
import { listPublicPartners } from "@/app/lib/tramassso-content";
import { buildPremiumMetadata } from "@/app/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPremiumMetadata({
  title: "Colaboradores Tramassso",
  description: "Directorio de negocios y marcas colaboradoras de la comunidad Tramassso.",
  path: "/partners",
  image: null,
});

export default async function PartnersPage() {
  const { partners } = await listPublicPartners();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Colaboradores</p>
          <h1 className="text-4xl font-black uppercase tracking-[0.12em] text-white md:text-6xl">Colaboradores de Tramassso</h1>
          <p className="max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
            Negocios, marcas y profesionales seleccionados para acompañar experiencias, rutas y eventos de la comunidad.
          </p>
        </div>

        {partners.length ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {partners.map((partner) => (
              <article key={partner.id} className="flex min-h-[22rem] flex-col rounded-[2rem] border border-zinc-800 bg-zinc-900/50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">{partner.category}</p>
                    <h2 className="mt-3 font-sans text-2xl font-semibold tracking-tight text-white">{partner.name}</h2>
                  </div>
                  {partner.is_featured ? (
                    <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-zinc-300">
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

                <p className="mt-5 flex-1 text-sm leading-7 text-zinc-400">
                  {partner.description ?? "Colaborador seleccionado de la comunidad Tramassso."}
                </p>

                {partner.website_url ? (
                  <a
                    href={partner.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex w-fit rounded-full border border-white/15 bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-white transition hover:border-white hover:bg-zinc-900"
                  >
                    Visitar web
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[2rem] border border-dashed border-zinc-800 bg-white/5 p-10 text-center">
            <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Aún no hay colaboradores publicados</p>
            <p className="mt-3 text-sm text-zinc-400">Pronto añadiremos negocios y marcas seleccionadas de la comunidad Tramassso.</p>
          </div>
        )}
      </section>
    </main>
  );
}
