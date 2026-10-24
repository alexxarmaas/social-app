import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { requestIdentifier } from "@/app/lib/rate-limit";
import { registrationSchema } from "@/app/lib/community";
import { communityRegistrationReady, persistentRateLimit, newAccountToken, hashAccountToken } from "@/app/lib/community-security";
import { sendAccountEmail } from "@/app/lib/community-email";

export async function POST(request: NextRequest) {
  if (!communityRegistrationReady()) {
    return NextResponse.json({ error: "El registro esta temporalmente desactivado. Vuelve mas tarde." }, { status: 503 });
  }
  const limit = await persistentRateLimit("register:" + requestIdentifier(request.headers), 5, 3600);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Demasiados intentos. Prueba mas tarde." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  }
  if (Number(request.headers.get("content-length") || "0") > 8192) return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Solicitud no valida." }, { status: 400 }); }
  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Comprueba los campos y la clave (minimo 12 caracteres)." }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ ok: true, verificationRequired: true }, { status: 201 });
  const secondLimit = await persistentRateLimit("register-email:" + parsed.data.email, 3, 24 * 3600);
  if (!secondLimit.allowed) return NextResponse.json({ error: "Demasiadas solicitudes. Vuelve mas tarde." }, { status: 429 });
  try {
    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
    const token = newAccountToken();
    await prisma.user.create({
      data: {
        username: parsed.data.username, name: parsed.data.name, email: parsed.data.email,
        password: hashedPassword, role: "user", verificationRequired: true,
        accountTokens: {
          create: { purpose: "verify", tokenHash: hashAccountToken(token), expiresAt: new Date(Date.now() + 3600000) },
        },
      },
    });
    const sent = await sendAccountEmail({ to: parsed.data.email, name: parsed.data.name, token, kind: "verify" });
    return NextResponse.json({
      ok: true, verificationRequired: true,
      message: sent ? "Revisa tu correo para activar tu cuenta." : "Cuenta creada, pero no se pudo enviar el correo. Solicita otro enlace de verificacion.",
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
      return NextResponse.json({ error: "El correo o usuario ya esta registrado." }, { status: 409 });
    console.error("Community registration failed", error);
    return NextResponse.json({ error: "No se pudo completar el registro." }, { status: 503 });
  }
}
