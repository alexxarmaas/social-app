import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { checkRateLimit } from "@/app/lib/rate-limit";
import { newClubSchema } from "@/app/lib/club-community";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const ownerId = session?.user?.id;
  if (!ownerId) return NextResponse.json({ error: "Inicia sesion para crear un club." }, { status: 401 });
  const limit = checkRateLimit("club-create:" + ownerId, 4, 24 * 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Demasiados intentos. Intentalo mas tarde." }, { status: 429 });
  if (Number(request.headers.get("content-length") || "0") > 9000) {
    return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Solicitud no valida." }, { status: 400 }); }
  const parsed = newClubSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Revisa los datos del club." }, { status: 400 });
  try {
    const owned = await prisma.club.count({ where: { ownerId } });
    if (owned >= 2) return NextResponse.json({ error: "Cada cuenta puede gestionar hasta dos clubes." }, { status: 409 });
    const club = await prisma.club.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        category: parsed.data.category,
        location: parsed.data.location || null,
        ownerId,
      },
      select: { id: true },
    });
    return NextResponse.json({ id: club.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un club con ese nombre." }, { status: 409 });
    }
    console.error("Club create failed", error);
    return NextResponse.json({ error: "No se pudo crear el club." }, { status: 503 });
  }
}
