import type { MetadataRoute } from "next";
import { metadataBase } from "@/app/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/garage", "/community", "/clubs", "/events", "/routes", "/partners", "/anunciarse", "/about", "/who-are-we", "/privacidad"].map((path) => ({
    url: new URL(path || "/", metadataBase).toString(),
    changeFrequency: path === "" || path === "/garage" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/garage" ? 0.9 : 0.7,
  }));
}
