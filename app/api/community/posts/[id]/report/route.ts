import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { reportInputSchema, socialEnabled } from "@/app/lib/community-social";
import { persistentRateLimit } from "@/app/lib/community-security";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!socialEnabled()) return NextResponse.json({ error: "No disponible." }, { status: 503 });
  const session = await getServerSession(authOptions);
  const reporterId = session?.user?.id;
  if (!reporterId) return NextResponse.json({ error: "Inicia sesion." }, { status: 401 });
  const limit = await persistentRateLimit("reports:" + reporterId, 15, 24 * 3600);
  if (!limit.allowed) return NextResponse.json({ error: "Demasiados reportes." }, { status: 429 });
  if (Number(request.headers.get("content-length") || "0") > 4000) return NextResponse.json({ error: "Solicitud incorrecta." }, { status: 400 });
  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud incorrecta." }, { status: 400 }); }
  const parsed = reportInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Selecciona un motivo." }, { status: 400 });
  try {
    const post = await prisma.post.findFirst({ where: { id, status: "published" }, select: { authorId: true } });
    if (!post) return NextResponse.json({ error: "Publicacion no disponible." }, { status: 404 });
    if (post.authorId === reporterId) return NextResponse.json({ error: "No puedes denunciar tu propia publicacion." }, { status: 400 });
    await prisma.postReport.create({ data: { postId: id, reporterId, reason: parsed.data.reason } });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
      return NextResponse.json({ ok: true });
    console.error("Post report failed", error);
    return NextResponse.json({ error: "No se pudo enviar." }, { status: 503 });
  }
}
