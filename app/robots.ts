import type { MetadataRoute } from "next";
import { metadataBase } from "@/app/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Previews must not compete with the real domain in Google.
  if (process.env.VERCEL_ENV === "preview") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin", "/api", "/acceso-interno-tramassso", "/account",
        "/garage/mine", "/garage/new", "/login", "/register",
        "/my-events", "/entry", "/tickets", "/verify-email",
        "/forgot-password", "/reset-password",
      ],
    }],
    sitemap: new URL("/sitemap.xml", metadataBase).toString(),
  };
}
