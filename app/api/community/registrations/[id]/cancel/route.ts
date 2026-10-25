import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/app/lib/auth";
import { createSupabaseServiceClient } from "@/app/lib/supabase";
import { persistentRateLimit } from "@/app/lib/community-security";
import { sendWaitlistPromotionNotification } from "@/app/lib/contact-email";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.EVENT_TICKETING_V2_ENABLED !== "true")
    return NextResponse.json({ error: "No disponible." }, { status: 503 });
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Inicia sesion." }, { status: 401 });
  const rate = await persistentRateLimit("registration-cancel:" + userId, 15, 24 * 3600);
  if (!rate.allowed) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Inscripcion no valida." }, { status: 400 });
  const client = createSupabaseServiceClient();
  // Ownership is verified against the server-side NextAuth user, not caller-provided data.
  const { data: existing, error: lookupError } = await client.from("event_registrations")
    .select("id,user_id,status").eq("id", id).eq("user_id", userId).maybeSingle();
  if (lookupError || !existing) return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });
  if (existing.status === "cancelled") return NextResponse.json({ ok: true });
  const { data, error } = await client.rpc("trm_set_event_status_v2", {
    p_registration_id: id, p_status: "cancelled", p_ticket_hash: null,
  });
  if (error) return NextResponse.json({ error: "No se pudo cancelar." }, { status: 503 });
  const result = data as { success?: boolean; error?: string };
  if (result?.success && "promotedId" in result && typeof result.promotedId === "string") await sendWaitlistPromotionNotification(result.promotedId);
  return result?.success ? NextResponse.json({ ok: true }) :
    NextResponse.json({ error: result?.error || "No se pudo cancelar." }, { status: 409 });
}
