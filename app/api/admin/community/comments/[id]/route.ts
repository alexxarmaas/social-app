import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/app/lib/admin-auth";
import { persistentRateLimit } from "@/app/lib/community-security";
import { moderationInputSchema, socialEnabled } from "@/app/lib/community-social";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!socialEnabled()) return NextResponse.json({ error: "No disponible." }, { status: 503 });
  const session = await getCurrentAdminSession();
  if (!session) return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  const rate = await persistentRateLimit("comment-review:" + session.user.id, 120, 3600);
  if (!rate.allowed) return NextResponse.json({ error: "Demasiadas acciones." }, { status: 429 });
  if (Number(request.headers.get("content-length") || "0") > 1500) return NextResponse.json({ error: "Datos excesivos." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Solicitud incorrecta." }, { status: 400 }); }
  const parsed = moderationInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Estado no válido." }, { status: 400 });
  const { id } = await params;
  try {
    const updated = await prisma.$transaction(async tx => {
      const comment = await tx.comment.findFirst({
        where: { id, status: "pending" },
        select: { authorId: true, postId: true, post: { select: { authorId: true } } },
      });
      if (!comment) return false;
      const result = await tx.comment.updateMany({
        where: { id, status: "pending" }, data: { status: parsed.data.status },
      });
      if (!result.count) return false;
      if (parsed.data.status === "published" && comment.authorId !== comment.post.authorId) {
        await tx.notification.create({
          data: {
            type: "COMMENT", actorId: comment.authorId, userId: comment.post.authorId,
            postId: comment.postId, message: "ha comentado tu publicación.",
          },
        });
      }
      return true;
    });
    return updated ? NextResponse.json({ ok: true }) :
      NextResponse.json({ error: "Comentario ya revisado o inexistente." }, { status: 409 });
  } catch (error) {
    console.error("Comment moderation failed", error);
    return NextResponse.json({ error: "No se pudo moderar." }, { status: 503 });
  }
}
