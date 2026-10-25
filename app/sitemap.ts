import type { MetadataRoute } from "next";
import { metadataBase } from "@/app/lib/seo";
import { prisma } from "@/app/lib/prisma";
import { listPublicEvents, listPublicRoutes, listPublicPartners, listPastEvents } from "@/app/lib/tramassso-content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = [
    "", "/garage", "/empezar", "/members", "/community", "/clubs", "/events", "/routes",
    "/partners", "/anunciarse", "/about", "/who-are-we", "/privacidad",
  ];
  const entries: MetadataRoute.Sitemap = paths.map((path) => ({
    url: new URL(path || "/", metadataBase).toString(),
    changeFrequency: path === "" || path === "/garage" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/garage" ? 0.9 : 0.7,
  }));
  const [content, community] = await Promise.allSettled([
    Promise.all([listPublicEvents(), listPastEvents(48), listPublicRoutes(), listPublicPartners()]),
    Promise.all([
      prisma.car.findMany({ take: 500, orderBy: { updatedAt: "desc" }, select: { id: true, updatedAt: true } }),
      prisma.club.findMany({ take: 200, select: { id: true, updatedAt: true } }),
      prisma.user.findMany({
        where: { cars: { some: {} } }, take: 300,
        select: { username: true, updatedAt: true },
      }),
    ]),
  ]);

  if (content.status === "fulfilled") {
    const [future, past, routes, partners] = content.value;
    const seen = new Set<string>();
    for (const event of [...future.events, ...past.events]) {
      if (seen.has(event.id)) continue;
      seen.add(event.id);
      entries.push({
        url: new URL("/events/" + event.id, metadataBase).toString(),
        lastModified: new Date(event.created_at),
        priority: 0.8,
      });
    }
    for (const route of routes.routes.slice(0, 300)) entries.push({
      url: new URL("/routes/" + route.id, metadataBase).toString(),
      lastModified: new Date(route.created_at), priority: 0.6,
    });
    for (const partner of partners.partners.slice(0, 200)) entries.push({
      url: new URL("/partners/" + partner.id, metadataBase).toString(),
      lastModified: new Date(partner.created_at), priority: 0.5,
    });
  }

  if (community.status === "fulfilled") {
    const [cars, clubs, members] = community.value;
    for (const car of cars) entries.push({
      url: new URL("/garage/" + car.id, metadataBase).toString(),
      lastModified: car.updatedAt, priority: 0.7,
    });
    for (const club of clubs) entries.push({
      url: new URL("/clubs/" + club.id, metadataBase).toString(),
      lastModified: club.updatedAt, priority: 0.6,
    });
    for (const member of members) entries.push({
      url: new URL("/members/" + encodeURIComponent(member.username), metadataBase).toString(),
      lastModified: member.updatedAt, priority: 0.5,
    });
  }
  if (process.env.COMMUNITY_SOCIAL_ENABLED === "true") {
    try {
      const posts = await prisma.post.findMany({
        where: { status: "published" },
        take: 300,
        orderBy: { updatedAt: "desc" },
        select: { id: true, updatedAt: true },
      });
      for (const post of posts) entries.push({
        url: new URL("/community/" + post.id, metadataBase).toString(),
        lastModified: post.updatedAt, priority: 0.5,
      });
    } catch (error) {
      console.error("Community sitemap unavailable", error);
    }
  }
  return entries;
}
