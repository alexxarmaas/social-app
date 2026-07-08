import type { Metadata } from "next";
import { luxuryFallbackImage, metadataBase } from "@/app/lib/seo";
import WebsiteNav from "@/components/WebsiteNav";

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Tramassso | Eventos y rutas premium en Gran Canaria",
    template: "%s | Tramassso",
  },
  description: "Eventos de coches, rutas por Gran Canaria y experiencias preparadas para patrocinadores.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tramassso | Eventos y rutas premium en Gran Canaria",
    description: "Eventos de coches, rutas por Gran Canaria y experiencias preparadas para patrocinadores.",
    url: "/",
    siteName: "Tramassso",
    images: [luxuryFallbackImage],
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tramassso | Eventos y rutas premium en Gran Canaria",
    description: "Eventos de coches, rutas por Gran Canaria y experiencias preparadas para patrocinadores.",
    images: [luxuryFallbackImage],
  },
};

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <WebsiteNav />
      {children}
    </>
  );
}
