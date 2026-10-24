import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { checkRateLimit, requestIdentifier } from "@/app/lib/rate-limit";
import { registrationSchema } from "@/app/lib/community";

export async function POST(request: NextRequest) {
  const limit = checkRateLimit("register:" + requestIdentifier(request.headers), 4, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Demasiados intentos. Prueba mas tarde." }, {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfter) },
    });
  }

  if (Number(request.headers.get("content-length") || "0") > 8192) {
    return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud no valida." }, { status: 400 });
  }
  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Comprueba los campos y la clave (minimo 12 caracteres)." }, { status: 400 });
  }
  // Honeypot: a normal browser leaves this blank.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  try {
    const password = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.create({
      data: {
        username: parsed.data.username,
        name: parsed.data.name,
        email: parsed.data.email,
        password,
        role: "user",
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "El correo o usuario ya esta registrado." }, { status: 409 });
    }
    console.error("Community registration failed", error);
    return NextResponse.json({ error: "No se pudo completar el registro." }, { status: 503 });
  }
}
