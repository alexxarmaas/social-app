import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { getValidAdsenseClientId } from "@/app/lib/adsense";
import { luxuryFallbackImage, metadataBase } from "@/app/lib/seo";
import Provider from "@/components/SessionProvider";
import PushNotificationManager from "@/components/notifications/PushNotificationManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const aeroblade = localFont({
  src: "./Aeroblade.ttf",
  variable: "--font-aeroblade",
});

export const metadata: Metadata = {
  title: "Tramassso | Eventos y rutas de motor en Gran Canaria",
  description: "Eventos deportivos, rutas de conducción y experiencias premium para la comunidad del motor en Gran Canaria.",
  metadataBase,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tramassso | Eventos y rutas de motor en Gran Canaria",
    description: "Eventos deportivos, rutas de conducción y experiencias premium para la comunidad del motor en Gran Canaria.",
    url: "/",
    siteName: "Tramassso",
    images: [luxuryFallbackImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tramassso | Eventos y rutas de motor en Gran Canaria",
    description: "Eventos deportivos, rutas de conducción y experiencias premium para la comunidad del motor en Gran Canaria.",
    images: [luxuryFallbackImage],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tramassso",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClientId = getValidAdsenseClientId();

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} ${aeroblade.variable} antialiased`}>
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
          <PushNotificationManager />
        </Provider>
      </body>
    </html>
  );
}
