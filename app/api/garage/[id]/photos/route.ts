import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";
import { carImageSchema } from "@/app/lib/community";
import { persistentRateLimit } from "@/app/lib/community-security";

const schema = z.object({
  url: carImageSchema,
  caption: z.string().trim().max(160).optional().default(""),
}).strict();

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.COMMUNITY_GALLERY_ENABLED !== "true")
    return NextResponse.json({ error: "La galeria no esta activada." }, { status: 503 });
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Inicia sesion." }, { status: 401 });
  const rate = await persistentRateLimit("garage-photo:" + userId, 30, 3600);
  if (!rate.allowed) return NextResponse.json({ error: "Demasiadas subidas." }, { status: 429 });
  if (Number(request.headers.get("content-length") || "0") > 4500) return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud incorrecta." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Imagen o pie de foto invalidos." }, { status: 400 });
  const { id } = await params;
  try {
    const car = await prisma.car.findFirst({ where: { id, ownerId: userId }, select: { id: true } });
    if (!car) return NextResponse.json({ error: "Vehiculo no encontrado." }, { status: 404 });
    const count = await prisma.carPhoto.count({ where: { carId: id } });
    if (count >= 8) return NextResponse.json({ error: "Maximo de ocho fotografias adicionales." }, { status: 409 });
    const photo = await prisma.carPhoto.create({
      data: { carId: id, url: parsed.data.url, caption: parsed.data.caption || null, sortOrder: count },
      select: { id: true, url: true, caption: true },
    });
    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    console.error("Garage photo add failed", error);
    return NextResponse.json({ error: "No se pudo guardar la fotografia." }, { status: 503 });
  }
}
