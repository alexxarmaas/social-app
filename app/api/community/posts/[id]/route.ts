import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { isAdminRole } from "@/app/lib/admin-auth";
import { socialEnabled } from "@/app/lib/community-social";
import { persistentRateLimit } from "@/app/lib/community-security";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!socialEnabled()) return NextResponse.json({ error: "No disponible." }, { status: 503 });
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Inicia sesion." }, { status: 401 });
  const rate = await persistentRateLimit("post-delete:" + session.user.id, 40, 3600);
  if (!rate.allowed) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const { id } = await params;
  try {
    const where = isAdminRole(session.user.role) ? { id } : { id, authorId: session.user.id };
    const result = await prisma.post.deleteMany({ where });
    if (!result.count) return NextResponse.json({ error: "Publicacion no encontrada." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Community post delete failed", error);
    return NextResponse.json({ error: "No se pudo eliminar." }, { status: 503 });
  }
}
