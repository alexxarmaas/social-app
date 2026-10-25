import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { checkRateLimit } from "@/app/lib/rate-limit";
import { communityProfileSchema } from "@/app/lib/community";

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Inicia sesion." }, { status: 401 });
  const limit = checkRateLimit("profile-edit:" + userId, 30, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });

  if (Number(request.headers.get("content-length") || "0") > 6000) {
    return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Solicitud incorrecta." }, { status: 400 }); }
  const parsed = communityProfileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Revisa tu nombre, biografia y ubicacion." }, { status: 400 });

  try {
    const result = await prisma.user.updateMany({
      where: { id: userId },
      data: {
        name: parsed.data.name,
        bio: parsed.data.bio || null,
        location: parsed.data.location || null,
      },
    });
    if (!result.count) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Community profile update failed", error);
    return NextResponse.json({ error: "No se pudo actualizar el perfil." }, { status: 503 });
  }
}
