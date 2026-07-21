import type { MetadataRoute } from "next";
import { metadataBase } from "@/app/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin", "/acceso-interno-tramassso"] }],
    sitemap: new URL("/sitemap.xml", metadataBase).toString(),
  };
}
