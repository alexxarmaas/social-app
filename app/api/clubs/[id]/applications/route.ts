import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { checkRateLimit } from "@/app/lib/rate-limit";
import { applicationActionSchema } from "@/app/lib/club-community";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Inicia sesion." }, { status: 401 });
  const limit = checkRateLimit("club-review:" + userId, 90, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const { id } = await params;
  const club = await prisma.club.findFirst({ where: { id, ownerId: userId }, select: { id: true } });
  if (!club) return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  if (Number(request.headers.get("content-length") || "0") > 4000) return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Solicitud no valida." }, { status: 400 }); }
  const parsed = applicationActionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Accion no valida." }, { status: 400 });
  try {
    const result = await prisma.clubMember.updateMany({
      where: { id: parsed.data.membershipId, clubId: id, status: "pending" },
      data: { status: parsed.data.action },
    });
    if (!result.count) return NextResponse.json({ error: "La solicitud ya no esta pendiente." }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Club application review failed", error);
    return NextResponse.json({ error: "No se pudo actualizar la solicitud." }, { status: 503 });
  }
}
