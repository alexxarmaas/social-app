import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { getValidAdsenseClientId } from "@/app/lib/adsense";
import { luxuryFallbackImage, metadataBase } from "@/app/lib/seo";

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
  title: "Tramassso | GC Driving Events & Routes",
  description: "Premium sports car events, driving routes, and sponsor-ready experiences in Gran Canaria.",
  metadataBase,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tramassso | GC Driving Events & Routes",
    description: "Premium sports car events, driving routes, and sponsor-ready experiences in Gran Canaria.",
    url: "/",
    siteName: "Tramassso",
    images: [luxuryFallbackImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tramassso | GC Driving Events & Routes",
    description: "Premium sports car events, driving routes, and sponsor-ready experiences in Gran Canaria.",
    images: [luxuryFallbackImage],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tramassso",
  },
};

export const viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import Provider from "@/components/SessionProvider";
import PushNotificationManager from "@/components/notifications/PushNotificationManager";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClientId = getValidAdsenseClientId();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${aeroblade.variable} antialiased`}
      >
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
