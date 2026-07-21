import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import localFont from "next/font/local";
import Script from "next/script";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { getValidAdsenseClientId } from "@/app/lib/adsense";
import { luxuryFallbackImage, metadataBase } from "@/app/lib/seo";
import Provider from "@/components/SessionProvider";

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
  other: {
    "google-adsense-account": "ca-pub-2456720977453256",
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
          {adsenseClientId ? (
            <Script
              id="adsense-script"
              strategy="afterInteractive"
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
              crossOrigin="anonymous"
            />
          ) : null}
          {children}
          <Analytics />
          <SpeedInsights />
        </Provider>
      </body>
    </html>
  );
}
