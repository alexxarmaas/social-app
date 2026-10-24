import type { Metadata } from "next";
import { luxuryFallbackImage, metadataBase } from "@/app/lib/seo";
import WebsiteNav from "@/components/WebsiteNav";
import WebsiteFooter from "@/components/WebsiteFooter";
import FloatingInstagram from "@/components/FloatingInstagram";

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
  return <><WebsiteNav />{children}<WebsiteFooter /><FloatingInstagram /></>;
}
