import type { Metadata } from "next";
import { luxuryFallbackImage, metadataBase } from "@/app/lib/seo";

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Tramassso | Premium GC Driving Events",
    template: "%s | Tramassso",
  },
  description: "Premium sports car events, route guides, and sponsor-ready experiences in Gran Canaria.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tramassso | Premium GC Driving Events",
    description: "Premium sports car events, route guides, and sponsor-ready experiences in Gran Canaria.",
    url: "/",
    siteName: "Tramassso",
    images: [luxuryFallbackImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tramassso | Premium GC Driving Events",
    description: "Premium sports car events, route guides, and sponsor-ready experiences in Gran Canaria.",
    images: [luxuryFallbackImage],
  },
};

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
