import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { persistentRateLimit } from "@/app/lib/community-security";
import { postInputSchema, socialEnabled } from "@/app/lib/community-social";

export async function POST(request: NextRequest) {
  if (!socialEnabled()) return NextResponse.json({ error: "El muro de comunidad esta en preparacion." }, { status: 503 });
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Inicia sesion." }, { status: 401 });
  const rate = await persistentRateLimit("posts:" + userId, 8, 24 * 3600);
  if (!rate.allowed) return NextResponse.json({ error: "Has publicado demasiadas veces. Vuelve mañana." }, { status: 429 });
  if (Number(request.headers.get("content-length") || "0") > 8000)
    return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud incorrecta." }, { status: 400 }); }
  const input = postInputSchema.safeParse(body);
  if (!input.success) return NextResponse.json({ error: "Revisa el texto o la imagen." }, { status: 400 });
  try {
    if (input.data.clubId) {
      const club = await prisma.club.findUnique({ where: { id: input.data.clubId }, select: { ownerId: true } });
      if (!club) return NextResponse.json({ error: "Club no encontrado." }, { status: 404 });
      if (club.ownerId !== userId) {
        const membership = await prisma.clubMember.findUnique({ where: { userId_clubId: { userId, clubId: input.data.clubId } } });
        if (!membership || membership.status !== "approved") return NextResponse.json({ error: "No perteneces a este club." }, { status: 403 });
      }
    }
    const post = await prisma.post.create({
      data: {
        authorId: userId, content: input.data.content, imageUrl: input.data.imageUrl || null,
        clubId: input.data.clubId || null, status: "pending",
      },
      select: { id: true },
    });
    return NextResponse.json({ id: post.id, status: "pending" }, { status: 201 });
  } catch (error) {
    console.error("Community post creation failed", error);
    return NextResponse.json({ error: "No se pudo publicar." }, { status: 503 });
  }
}
