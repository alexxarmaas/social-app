import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { carSchema, carDatabaseData } from "@/app/lib/community";
import { checkRateLimit } from "@/app/lib/rate-limit";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const ownerId = session?.user?.id;
  if (!ownerId) return NextResponse.json({ error: "Inicia sesion." }, { status: 401 });

  const limit = checkRateLimit("garage-create:" + ownerId, 12, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Has creado demasiadas fichas." }, { status: 429 });
  }

  if (Number(request.headers.get("content-length") || "0") > 12000) {
    return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "JSON no valido." }, { status: 400 }); }

  const parsed = carSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa los datos del vehiculo.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const count = await prisma.car.count({ where: { ownerId } });
    if (count >= 10) return NextResponse.json({ error: "Maximo de 10 vehiculos por cuenta." }, { status: 409 });
    const car = await prisma.car.create({
      data: { ...carDatabaseData(parsed.data), ownerId },
      select: { id: true },
    });
    return NextResponse.json({ id: car.id }, { status: 201 });
  } catch (error) {
    console.error("Garage create failed", error);
    return NextResponse.json({ error: "No se ha podido guardar el vehiculo." }, { status: 503 });
  }
}


/**
 * Only a signed-in owner can see their saved vehicle choices.
 * Public garage data is served through the existing /garage pages instead.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const ownerId = session?.user?.id;
  if (!ownerId) return NextResponse.json({ error: "Inicia sesion." }, { status: 401 });
  try {
    const cars = await prisma.car.findMany({
      where: { ownerId },
      select: { id: true, make: true, model: true, year: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return NextResponse.json({ cars }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Garage selection unavailable", error);
    return NextResponse.json({ error: "No se pudieron consultar los vehiculos." }, { status: 503 });
  }
}
