import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { requestIdentifier } from "@/app/lib/rate-limit";
import { issueAccountToken, persistentRateLimit, communityOrigin } from "@/app/lib/community-security";
import { sendAccountEmail } from "@/app/lib/community-email";

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  kind: z.enum(["verify", "reset"]),
}).strict();

export async function POST(request: NextRequest) {
  const generic = { ok: true, message: "Si la cuenta existe, recibiras un correo con las instrucciones." };
  if (!communityOrigin() || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD)
    return NextResponse.json({ error: "Servicio de correo temporalmente no disponible." }, { status: 503 });
  const rate = await persistentRateLimit("account-link:" + requestIdentifier(request.headers), 5, 3600);
  if (!rate.allowed) return NextResponse.json({ error: "Demasiados intentos." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  if (Number(request.headers.get("content-length") || "0") > 4096) return NextResponse.json(generic);
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json(generic); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json(generic);
  const secondRate = await persistentRateLimit("account-email:" + parsed.data.email + ":" + parsed.data.kind, 3, 3600);
  if (!secondRate.allowed) return NextResponse.json(generic);
  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: {
      id: true, name: true, username: true, verificationRequired: true, emailVerifiedAt: true,
    } });
    const shouldSend = Boolean(user && (parsed.data.kind === "reset" || (user.verificationRequired && !user.emailVerifiedAt)));
    if (user && shouldSend) {
      const token = await issueAccountToken(user.id, parsed.data.kind, parsed.data.kind === "verify" ? 60 : 30);
      await sendAccountEmail({ to: parsed.data.email, name: user.name || user.username, token, kind: parsed.data.kind });
    }
  } catch (error) { console.error("Account link request failed", error); }
  return NextResponse.json(generic);
}
