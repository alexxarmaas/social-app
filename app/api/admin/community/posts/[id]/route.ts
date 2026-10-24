import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/app/lib/admin-auth";
import { prisma } from "@/app/lib/prisma";
import { persistentRateLimit } from "@/app/lib/community-security";
import { moderationInputSchema, socialEnabled } from "@/app/lib/community-social";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentAdminSession();
  if (!session) return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  if (!socialEnabled()) return NextResponse.json({ error: "Moderacion no habilitada." }, { status: 503 });
  const rate = await persistentRateLimit("moderation:" + session.user.id, 100, 3600);
  if (!rate.allowed) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  if (Number(request.headers.get("content-length") || "0") > 4000) return NextResponse.json({ error: "Solicitud incorrecta." }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud incorrecta." }, { status: 400 }); }
  const input = moderationInputSchema.safeParse(body);
  if (!input.success) return NextResponse.json({ error: "Estado incorrecto." }, { status: 400 });
  const { id } = await params;
  try {
    const result = await prisma.post.updateMany({
      where: { id }, data: { status: input.data.status },
    });
    if (!result.count) return NextResponse.json({ error: "Publicacion no encontrada." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Moderation update failed", error);
    return NextResponse.json({ error: "No se pudo moderar." }, { status: 503 });
  }
}
