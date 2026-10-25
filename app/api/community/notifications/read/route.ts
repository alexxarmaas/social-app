import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { socialEnabled } from "@/app/lib/community-social";
import { persistentRateLimit } from "@/app/lib/community-security";

export async function POST() {
  if (!socialEnabled()) return NextResponse.json({ error: "No disponible." }, { status: 503 });
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  const limit = await persistentRateLimit("notifications-read:" + userId, 30, 3600);
  if (!limit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });

  try {
    const updated = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return NextResponse.json({ ok: true, updated: updated.count });
  } catch (error) {
    console.error("Notification read update failed", error);
    return NextResponse.json({ error: "No se pudieron actualizar los avisos." }, { status: 503 });
  }
}
