import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { persistentRateLimit } from "@/app/lib/community-security";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; photoId: string }> }) {
  if (process.env.COMMUNITY_GALLERY_ENABLED !== "true")
    return NextResponse.json({ error: "La galeria no esta activada." }, { status: 503 });
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Inicia sesion." }, { status: 401 });
  const rate = await persistentRateLimit("garage-photo-remove:" + userId, 30, 3600);
  if (!rate.allowed) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const { id, photoId } = await params;
  try {
    const result = await prisma.carPhoto.deleteMany({
      where: { id: photoId, carId: id, car: { ownerId: userId } },
    });
    if (!result.count) return NextResponse.json({ error: "Fotografia no encontrada." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Garage photo delete failed", error);
    return NextResponse.json({ error: "No se pudo eliminar la fotografia." }, { status: 503 });
  }
}
