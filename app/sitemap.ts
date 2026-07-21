import type { MetadataRoute } from "next";
import { metadataBase } from "@/app/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/events", "/routes", "/partners", "/about", "/who-are-we", "/privacidad"].map((path) => ({
    url: new URL(path || "/", metadataBase).toString(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
