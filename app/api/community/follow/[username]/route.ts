import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { persistentRateLimit } from "@/app/lib/community-security";
import { socialEnabled } from "@/app/lib/community-social";
import { usernameSchema } from "@/app/lib/community";

async function prepare(username: string) {
  if (!socialEnabled()) return { error: NextResponse.json({ error: "No disponible." }, { status: 503 }) };
  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) return { error: NextResponse.json({ error: "Usuario incorrecto." }, { status: 400 }) };
  const session = await getServerSession(authOptions);
  const followerId = session?.user?.id;
  if (!followerId) return { error: NextResponse.json({ error: "Inicia sesion." }, { status: 401 }) };
  const rate = await persistentRateLimit("follow:" + followerId, 50, 3600);
  if (!rate.allowed) return { error: NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 }) };
  const user = await prisma.user.findUnique({ where: { username: parsed.data }, select: { id: true } });
  if (!user) return { error: NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 }) };
  if (user.id === followerId) return { error: NextResponse.json({ error: "No puedes seguirte a ti mismo." }, { status: 400 }) };
  return { followerId, followingId: user.id };
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const auth = await prepare((await params).username);
    if ("error" in auth) return auth.error;
    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: auth.followerId, followingId: auth.followingId } },
      create: { followerId: auth.followerId, followingId: auth.followingId },
      update: {},
    });
    return NextResponse.json({ following: true });
  } catch (error) {
    console.error("Follow failed", error);
    return NextResponse.json({ error: "No se pudo seguir al usuario." }, { status: 503 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const auth = await prepare((await params).username);
    if ("error" in auth) return auth.error;
    await prisma.follow.deleteMany({ where: { followerId: auth.followerId, followingId: auth.followingId } });
    return NextResponse.json({ following: false });
  } catch (error) {
    console.error("Unfollow failed", error);
    return NextResponse.json({ error: "No se pudo dejar de seguir." }, { status: 503 });
  }
}
