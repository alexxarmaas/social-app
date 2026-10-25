import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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
  const post = await prisma.post.findFirst({
    where: { id, status: "published" }, select: { id: true, authorId: true },
  });
  if (!post) return { error: NextResponse.json({ error: "Publicacion no disponible." }, { status: 404 }) };
  return { userId, authorId: post.authorId };
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const auth = await prepare(id);
    if ("error" in auth) return auth.error;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.like.create({ data: { userId: auth.userId, postId: id } });
        if (auth.userId !== auth.authorId) {
          await tx.notification.create({
            data: {
              userId: auth.authorId, actorId: auth.userId, postId: id,
              type: "LIKE", message: "ha dado me gusta a una de tus publicaciones.",
            },
          });
        }
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
    }
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
