import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { persistentRateLimit } from "@/app/lib/community-security";
import { socialEnabled } from "@/app/lib/community-social";

async function prepare(id: string) {
  if (!socialEnabled()) return { error: NextResponse.json({ error: "No disponible." }, { status: 503 }) };
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { error: NextResponse.json({ error: "Inicia sesion." }, { status: 401 }) };
  const rate = await persistentRateLimit("likes:" + userId, 120, 3600);
  if (!rate.allowed) return { error: NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 }) };
  if (!(await prisma.post.findFirst({ where: { id, status: "published" }, select: { id: true } })))
    return { error: NextResponse.json({ error: "Publicacion no disponible." }, { status: 404 }) };
  return { userId };
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const auth = await prepare(id);
    if ("error" in auth) return auth.error;
    await prisma.like.upsert({
      where: { userId_postId: { userId: auth.userId, postId: id } },
      create: { userId: auth.userId, postId: id },
      update: {},
    });
    return NextResponse.json({ liked: true });
  } catch (error) {
    console.error("Like creation failed", error);
    return NextResponse.json({ error: "No se pudo guardar." }, { status: 503 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const auth = await prepare(id);
    if ("error" in auth) return auth.error;
    await prisma.like.deleteMany({ where: { userId: auth.userId, postId: id } });
    return NextResponse.json({ liked: false });
  } catch (error) {
    console.error("Like deletion failed", error);
    return NextResponse.json({ error: "No se pudo actualizar." }, { status: 503 });
  }
}
