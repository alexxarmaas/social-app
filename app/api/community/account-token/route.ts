import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { persistentRateLimit, hashAccountToken, validAccountToken } from "@/app/lib/community-security";
import { requestIdentifier } from "@/app/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rate = await persistentRateLimit("account-token:" + requestIdentifier(request.headers), 10, 3600);
  if (!rate.allowed) return NextResponse.json({ error: "Demasiados intentos." }, { status: 429 });
  if (Number(request.headers.get("content-length") || "0") > 4096) return NextResponse.json({ error: "Solicitud no valida." }, { status: 400 });
  let body: { token?: unknown; password?: unknown; kind?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud no valida." }, { status: 400 }); }
  if (!validAccountToken(body.token) || !["verify", "reset"].includes(String(body.kind)))
    return NextResponse.json({ error: "Enlace incorrecto." }, { status: 400 });
  if (body.kind === "reset" && (typeof body.password !== "string" || body.password.length < 12 || body.password.length > 128))
    return NextResponse.json({ error: "La clave debe tener entre 12 y 128 caracteres." }, { status: 400 });
  const tokenHash = hashAccountToken(body.token);
  try {
    const candidate = await prisma.accountToken.findUnique({ where: { tokenHash }, select: { id: true, userId: true, purpose: true, usedAt: true, expiresAt: true } });
    if (!candidate || candidate.usedAt || candidate.expiresAt <= new Date() || candidate.purpose !== body.kind)
      return NextResponse.json({ error: "El enlace no es valido o ha caducado." }, { status: 400 });
    const password = body.kind === "reset" ? await bcrypt.hash(body.password as string, 12) : null;
    const accepted = await prisma.$transaction(async tx => {
      const consumed = await tx.accountToken.updateMany({
        where: { id: candidate.id, usedAt: null, expiresAt: { gt: new Date() }, purpose: candidate.purpose },
        data: { usedAt: new Date() },
      });
      if (!consumed.count) return false;
      if (body.kind === "verify")
        await tx.user.update({ where: { id: candidate.userId }, data: { emailVerifiedAt: new Date() } });
      else
        await tx.user.update({ where: { id: candidate.userId }, data: { password: password as string } });
      await tx.accountToken.deleteMany({ where: { userId: candidate.userId, purpose: candidate.purpose, id: { not: candidate.id } } });
      return true;
    });
    if (!accepted) return NextResponse.json({ error: "El enlace ya se ha utilizado." }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Account token confirmation failed", error);
    return NextResponse.json({ error: "No se ha podido completar la solicitud." }, { status: 503 });
  }
}
