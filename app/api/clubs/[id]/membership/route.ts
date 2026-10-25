import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { checkRateLimit } from "@/app/lib/rate-limit";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Inicia sesion." }, { status: 401 });
  const limit = checkRateLimit("club-join:" + userId, 20, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const { id } = await params;
  try {
    const club = await prisma.club.findUnique({ where: { id }, select: { id: true, ownerId: true } });
    if (!club) return NextResponse.json({ error: "Club no encontrado." }, { status: 404 });
    if (club.ownerId === userId) return NextResponse.json({ error: "Ya gestionas este club." }, { status: 409 });
    const existing = await prisma.clubMember.findUnique({ where: { userId_clubId: { userId, clubId: id } } });
    if (existing) return NextResponse.json({ error: "Ya existe una solicitud de afiliacion." }, { status: 409 });
    await prisma.clubMember.create({ data: { userId, clubId: id, role: "member", status: "pending" } });
    return NextResponse.json({ status: "pending" }, { status: 201 });
  } catch (error) {
    console.error("Club join failed", error);
    return NextResponse.json({ error: "No se pudo solicitar el ingreso." }, { status: 503 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Inicia sesion." }, { status: 401 });
  const limit = checkRateLimit("club-leave:" + userId, 20, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const { id } = await params;
  try {
    await prisma.clubMember.deleteMany({ where: { userId, clubId: id } });
    return NextResponse.json({ status: "none" });
  } catch (error) {
    console.error("Club leave failed", error);
    return NextResponse.json({ error: "No se pudo cancelar." }, { status: 503 });
  }
}
