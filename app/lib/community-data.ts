import { prisma } from "@/app/lib/prisma";

const carSelection = {
  id: true,
  make: true,
  model: true,
  year: true,
  imageUrl: true,
  description: true,
  color: true,
  engine: true,
  horsepower: true,
  modifications: true,
  ownerId: true,
  createdAt: true,
  owner: { select: { username: true, name: true, avatar: true } },
} as const;

export async function latestPublicCars(limit = 12) {
  try {
    return await prisma.car.findMany({
      take: Math.max(1, Math.min(limit, 24)),
      orderBy: { createdAt: "desc" },
      select: carSelection,
    });
  } catch (error) {
    console.error("Garage list unavailable", error);
    return [];
  }
}

export async function publicCar(id: string) {
  try {
    return await prisma.car.findUnique({ where: { id }, select: carSelection });
  } catch (error) {
    console.error("Garage detail unavailable", error);
    return null;
  }
}


export async function searchPublicCars(filters: { q?: string; make?: string; minYear?: number; maxYear?: number }) {
  const q = (filters.q || "").trim().slice(0, 60);
  const make = (filters.make || "").trim().slice(0, 50);
  const minYear = filters.minYear && filters.minYear >= 1900 && filters.minYear <= 2030 ? filters.minYear : undefined;
  const maxYear = filters.maxYear && filters.maxYear >= 1900 && filters.maxYear <= 2030 ? filters.maxYear : undefined;
  try {
    return await prisma.car.findMany({
      where: {
        ...(q ? { OR: [{ make: { contains: q, mode: "insensitive" } }, { model: { contains: q, mode: "insensitive" } }] } : {}),
        ...(make ? { make: { contains: make, mode: "insensitive" } } : {}),
        ...(minYear || maxYear ? { year: { ...(minYear ? { gte: minYear } : {}), ...(maxYear ? { lte: maxYear } : {}) } } : {}),
      },
      orderBy: { createdAt: "desc" }, take: 48, select: carSelection,
    });
  } catch (error) {
    console.error("Garage search unavailable", error);
    return [];
  }
}

export async function publicCarPhotos(carId: string) {
  if (process.env.COMMUNITY_GALLERY_ENABLED !== "true") return [];
  try {
    return await prisma.carPhoto.findMany({
      where: { carId }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      take: 8, select: { id: true, url: true, caption: true },
    });
  } catch (error) {
    console.error("Garage gallery unavailable", error);
    return [];
  }
}
