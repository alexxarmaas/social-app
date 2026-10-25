import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { getCurrentAdminSession } from "@/app/lib/admin-auth";
import { createSupabaseServiceClient } from "@/app/lib/supabase";
import { persistentRateLimit, validAccountToken } from "@/app/lib/community-security";

const inputSchema = z.object({ eventId: z.string().uuid(), token: z.string() }).strict();

export async function POST(request: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  if (process.env.EVENT_TICKETING_V2_ENABLED !== "true")
    return NextResponse.json({ error: "El control QR aun no esta activado." }, { status: 503 });
  const rate = await persistentRateLimit("checkin:" + session.user.id, 100, 3600);
  if (!rate.allowed) return NextResponse.json({ error: "Demasiadas lecturas." }, { status: 429 });
  if (Number(request.headers.get("content-length") || "0") > 4096) return NextResponse.json({ error: "Solicitud incorrecta." }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud incorrecta." }, { status: 400 }); }
  const parsed = inputSchema.safeParse(body);
  if (!parsed.success || !validAccountToken(parsed.data.token)) return NextResponse.json({ error: "Entrada incorrecta." }, { status: 400 });
  const hash = createHash("sha256").update(parsed.data.token).digest("hex");
  const { data, error } = await createSupabaseServiceClient().rpc("trm_checkin_event_v2", {
    p_event_id: parsed.data.eventId, p_ticket_hash: hash,
  });
  if (error) {
    console.error("QR checkin RPC failed", error.code);
    return NextResponse.json({ error: "No se pudo verificar la entrada." }, { status: 503 });
  }
  const result = data as { success?: boolean; error?: string };
  return result?.success ? NextResponse.json({ success: true }) :
    NextResponse.json({ error: result?.error || "Entrada invalida." }, { status: 409 });
}
