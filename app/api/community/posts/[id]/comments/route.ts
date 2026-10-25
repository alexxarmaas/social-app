import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { socialEnabled, commentInputSchema } from "@/app/lib/community-social";
import { persistentRateLimit } from "@/app/lib/community-security";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  if (!socialEnabled()) return NextResponse.json({ error: "No disponible." }, { status: 503 });
  const session = await getServerSession(authOptions);
  const authorId = session?.user?.id;
  if (!authorId) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  const rate = await persistentRateLimit("comment:" + authorId, 25, 24 * 3600);
  if (!rate.allowed) return NextResponse.json({ error: "Has comentado demasiadas veces hoy." }, { status: 429 });
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Publicación no válida." }, { status: 400 });
  if (Number(request.headers.get("content-length") || "0") > 3000)
    return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Solicitud incorrecta." }, { status: 400 }); }
  const parsed = commentInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Escribe un comentario de entre 3 y 600 caracteres." }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ ok: true, status: "pending" }, { status: 201 });

  try {
    const post = await prisma.post.findFirst({ where: { id, status: "published" }, select: { id: true } });
    if (!post) return NextResponse.json({ error: "Publicación no disponible." }, { status: 404 });
    await prisma.comment.create({
      data: { authorId, postId: id, content: parsed.data.content, status: "pending" },
    });
    return NextResponse.json({ ok: true, status: "pending" }, { status: 201 });
  } catch (error) {
    console.error("Community comment create failed", error);
    return NextResponse.json({ error: "No se pudo guardar el comentario." }, { status: 503 });
  }
}
