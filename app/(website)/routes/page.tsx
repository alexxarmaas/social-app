import type { Metadata } from "next";
import TramasssoIcon from "@/components/ui/TramasssoIcon";
import { getAdsenseSlot, TRAMASSSO_ADSENSE_SLOTS } from "@/app/lib/adsense";
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
  const adSlot = getAdsenseSlot(process.env.NEXT_PUBLIC_ADSENSE_SLOT_ROUTES_1, TRAMASSSO_ADSENSE_SLOTS.routes);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#08090a] text-white">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-5 sm:py-14 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <span className="trm-pill"><TramasssoIcon name="routes" frame={false} size="sm" /> Tramassso / Rutas</span>
          <h1 className="mt-5 font-sans text-[clamp(2.7rem,5.7vw,4.8rem)] font-black uppercase leading-[1.04] tracking-[-0.05em]">Gran Canaria en ruta.</h1>
          <p className="max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">Trazados seleccionados para conducir, grabar y disfrutar.</p>
        </div>

        {error ? <p className="mt-8 text-sm text-red-300">No hemos podido cargar las rutas.</p> : null}

        <RoutesExplorer routes={routes} adSlot={adSlot} />
      </section>
    </main>
  );
}
