import { createHash } from "node:crypto";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentAdminSession } from "@/app/lib/admin-auth";
import { validAccountToken } from "@/app/lib/community-security";
import { createSupabaseServiceClient } from "@/app/lib/supabase";
import CheckinConfirmation from "@/components/events/CheckinConfirmation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Validar entrada", robots: { index: false, follow: false } };

export default async function EntryPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (process.env.EVENT_TICKETING_V2_ENABLED !== "true" || !validAccountToken(token)) notFound();
  if (!(await getCurrentAdminSession())) redirect("/acceso-interno-tramassso?next=" + encodeURIComponent("/entry/" + token));
  const hash = createHash("sha256").update(token).digest("hex");
  const { data, error } = await createSupabaseServiceClient().from("event_registrations")
    .select("event_id,name,vehicle,companions,status,checked_in_at,events(title)")
    .eq("ticket_hash", hash).maybeSingle();
  if (error || !data || data.status !== "confirmed") notFound();
  const event = Array.isArray(data.events) ? data.events[0] : data.events;
  return (
    <main className="min-h-screen bg-zinc-950 px-5 py-14 text-white">
      <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-zinc-900/50 p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-400">Control de acceso · Tramassso</p>
        <h1 className="mt-6 text-3xl font-black uppercase">{event?.title || "Evento"}</h1>
        <p className="mt-5 text-xl font-semibold">{String(data.name)}</p>
        <p className="mt-2 text-zinc-300">{String(data.vehicle || "Vehiculo")}</p>
        <p className="mt-3 text-xs uppercase tracking-wider text-zinc-500">1 coche · {1 + Number(data.companions || 0)} personas</p>
        <CheckinConfirmation eventId={data.event_id} token={token} alreadyUsed={Boolean(data.checked_in_at)} />
      </div>
    </main>
  );
}
