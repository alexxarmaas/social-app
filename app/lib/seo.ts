import type { Metadata } from "next";

export const metadataBase = new URL("https://tramassso.com");

export const luxuryFallbackPath = "/og/tramassso-brand.svg";
export const luxuryFallbackImage = new URL("/og/tramassso-brand.svg", metadataBase).toString();

export function buildPremiumMetadata(options: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  extra?: Metadata;
}): Metadata {
  const canonical = new URL(options.path, metadataBase).toString();
  const image = options.image && options.image.trim().length > 0 ? options.image : luxuryFallbackImage;

  return {
    metadataBase,
    title: options.title,
    description: options.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: options.title,
      description: options.description,
      url: canonical,
      siteName: "Tramassso",
      type: options.type ?? "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: options.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: [image],
    },
    ...options.extra,
  };
}