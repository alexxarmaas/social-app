import type { Metadata } from "next";
import { luxuryFallbackImage, metadataBase } from "@/app/lib/seo";
import WebsiteNav from "@/components/WebsiteNav";
import WebsiteFooter from "@/components/WebsiteFooter";
import FloatingInstagram from "@/components/FloatingInstagram";
import { isIsolatedStagingReady } from "@/app/lib/staging-guard";

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Tramassso | Comunidad del motor, garajes y eventos",
    template: "%s | Tramassso",
  },
  description: "Tramassso es la comunidad gratuita del motor. Crea tu garaje, comparte tu proyecto, descubre quedadas y explora rutas desde Gran Canaria.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Tramassso | Comunidad del motor, garajes y eventos",
    description: "Tu coche, tu historia, tu comunidad. Descubre Garage, eventos y rutas en Tramassso.",
    url: "/",
    siteName: "Tramassso",
    images: [luxuryFallbackImage],
    locale: "es_ES",
  },
};

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const isPreview = process.env.VERCEL_ENV === "preview" || process.env.TRAMASSSO_STAGING_MODE === "true";
  const readOnly = isPreview && !isIsolatedStagingReady(process.env);
  return <>
    <WebsiteNav />
    {readOnly ? (
      <div role="status" className="border-b border-orange-500/30 bg-[#28120c] px-4 py-2.5 text-center text-xs font-semibold leading-5 text-orange-200">
        Vista previa en solo lectura: registro, inscripciones y cambios desactivados hasta configurar staging aislado.
      </div>
    ) : null}
    {children}<WebsiteFooter /><FloatingInstagram />
  </>;
}
