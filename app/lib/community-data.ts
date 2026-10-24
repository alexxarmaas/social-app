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
