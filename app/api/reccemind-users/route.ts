import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { getCurrentAdminSession } from "@/app/lib/admin-auth";
import { checkRateLimit, requestIdentifier } from "@/app/lib/rate-limit";
import { RECCEMIND_TESTER_ROLE } from "@/app/lib/reccemind-auth";

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeName(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 100) : "";
}

function makeUsername(email: string) {
  const base = (email.split("@")[0] || "tester")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32) || "tester";
  return `recce-${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { role: RECCEMIND_TESTER_ROLE },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }

  const rateLimit = checkRateLimit(
    `reccemind-user-create:${session.user.id}:${requestIdentifier(request.headers)}`,
    10,
    60 * 60 * 1000,
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Demasiadas cuentas creadas. Inténtalo más tarde." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } },
    );
  }

  let payload: { email?: unknown; name?: unknown; password?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const email = normalizeEmail(payload.email);
  const name = normalizeName(payload.name);
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Introduce un correo válido." }, { status: 400 });
  }
  if (password.length < 10) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 10 caracteres." }, { status: 400 });
  }
  if (password.length > 128) {
    return NextResponse.json({ error: "La contraseña es demasiado larga." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese correo." }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      username: makeUsername(email),
      password: hashedPassword,
      role: RECCEMIND_TESTER_ROLE,
      name: name || null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
