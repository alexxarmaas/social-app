import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { carSchema, carDatabaseData } from "@/app/lib/community";
import { checkRateLimit } from "@/app/lib/rate-limit";

type Context = { params: Promise<{ id: string }> };

async function ownerContext(context: Context) {
  const session = await getServerSession(authOptions);
  const { id } = await context.params;
  return { id, ownerId: session?.user?.id };
}

export async function PATCH(request: NextRequest, context: Context) {
  const { id, ownerId } = await ownerContext(context);
  if (!ownerId) return NextResponse.json({ error: "Inicia sesion." }, { status: 401 });
  const limit = checkRateLimit("garage-edit:" + ownerId, 60, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  if (Number(request.headers.get("content-length") || "0") > 12000) {
    return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "JSON no valido." }, { status: 400 }); }
  const parsed = carSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos del vehiculo invalidos." }, { status: 400 });
  try {
    const updated = await prisma.car.updateMany({
      where: { id, ownerId },
      data: carDatabaseData(parsed.data),
    });
    if (!updated.count) return NextResponse.json({ error: "Vehiculo no encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("Garage update failed", error);
    return NextResponse.json({ error: "No se pudo actualizar." }, { status: 503 });
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  const { id, ownerId } = await ownerContext(context);
  if (!ownerId) return NextResponse.json({ error: "Inicia sesion." }, { status: 401 });
  const limit = checkRateLimit("garage-delete:" + ownerId, 20, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  try {
    const deleted = await prisma.car.deleteMany({ where: { id, ownerId } });
    if (!deleted.count) return NextResponse.json({ error: "Vehiculo no encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Garage delete failed", error);
    return NextResponse.json({ error: "No se pudo eliminar." }, { status: 503 });
  }
}
