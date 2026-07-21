import type { Metadata } from "next";
import { listPublicRoutes } from "@/app/lib/tramassso-content";
import { buildPremiumMetadata } from "@/app/lib/seo";
import RoutesExplorer from "@/components/routes/RoutesExplorer";

export const revalidate = 60;

export const metadata: Metadata = buildPremiumMetadata({
  title: "Rutas Tramassso",
  description: "Rutas de motor por Gran Canaria con estetica Tramassso.",
  path: "/routes",
  image: null,
});

export default async function RoutesGuidePage() {
  const { routes, error } = await listPublicRoutes();

  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-50">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-5 sm:py-14 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <p className="racing-eyebrow text-xs uppercase tracking-[0.45em] text-zinc-500">Rutas</p>
          <h1 className="text-balance text-3xl font-black uppercase tracking-[0.06em] text-white sm:text-4xl sm:tracking-[0.1em] md:text-6xl">Gran Canaria en ruta</h1>
          <p className="max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">Trazados seleccionados para conducir, grabar y disfrutar.</p>
        </div>

        {error ? <p className="mt-8 text-sm text-red-300">No hemos podido cargar las rutas.</p> : null}

        <RoutesExplorer routes={routes} adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ROUTES_1 ?? "0000000000"} />
      </section>
    </main>
  );
}
