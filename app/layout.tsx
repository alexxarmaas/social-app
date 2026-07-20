import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import localFont from "next/font/local";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { getValidAdsenseClientId } from "@/app/lib/adsense";
import { luxuryFallbackImage, metadataBase } from "@/app/lib/seo";
import Provider from "@/components/SessionProvider";
import AdsConsent from "@/components/ads/AdsConsent";

const aeroblade = localFont({
  src: "./Aeroblade.ttf",
  variable: "--font-aeroblade",
});

export const metadata: Metadata = {
  title: "Tramassso | Eventos y rutas de motor en Gran Canaria",
  description: "Eventos deportivos, rutas de conduccion y experiencias premium para la comunidad del motor en Gran Canaria.",
  metadataBase,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tramassso | Eventos y rutas de motor en Gran Canaria",
    description: "Eventos deportivos, rutas de conduccion y experiencias premium para la comunidad del motor en Gran Canaria.",
    url: "/",
    siteName: "Tramassso",
    images: [luxuryFallbackImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tramassso | Eventos y rutas de motor en Gran Canaria",
    description: "Eventos deportivos, rutas de conduccion y experiencias premium para la comunidad del motor en Gran Canaria.",
    images: [luxuryFallbackImage],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClientId = getValidAdsenseClientId();

  return (
    <html lang="es">
      <body className={`${aeroblade.variable} antialiased`}>
        <Provider>
          {adsenseClientId ? <AdsConsent clientId={adsenseClientId} /> : null}
          {children}
          <Analytics />
          <SpeedInsights />
        </Provider>
      </body>
    </html>
  );
}
