import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { QRCodeSVG } from "qrcode.react";
import { createHash } from "node:crypto";
import { createSupabaseServiceClient } from "@/app/lib/supabase";
import { communityOrigin, validAccountToken } from "@/app/lib/community-security";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mi entrada Tramassso", robots: { index: false, follow: false } };

type Props = { params: Promise<{ token: string }> };

export default async function TicketPage({ params }: Props) {
  const { token } = await params;
  if (process.env.EVENT_TICKETING_V2_ENABLED !== "true" || !validAccountToken(token)) notFound();
  const hash = createHash("sha256").update(token).digest("hex");
  const client = createSupabaseServiceClient();
  const { data, error } = await client.from("event_registrations")
    .select("id,status,vehicle,companions,checked_in_at,events(title,date,location)")
    .eq("ticket_hash", hash).maybeSingle();
  if (error || !data || data.status !== "confirmed") notFound();
  const event = Array.isArray(data.events) ? data.events[0] : data.events;
  if (!event) notFound();
  const checkinUrl = new URL("/entry/" + token, communityOrigin() || "https://tramassso.com").toString();
  return (
    <main className="min-h-screen bg-zinc-950 px-5 py-12 text-white">
      <article className="mx-auto max-w-lg overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-br from-[#25120a] to-black p-7 text-center shadow-2xl sm:p-10">
        <p className="font-aeroblade text-3xl tracking-widest">Tramassso<span className="text-orange-500">.</span></p>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-orange-400">Entrada digital · Personal</p>
        <h1 className="mt-5 text-3xl font-black uppercase">{String(event.title)}</h1>
        <p className="mt-4 text-sm text-zinc-400">{new Date(String(event.date)).toLocaleString("es-ES", { timeZone: "Atlantic/Canary", dateStyle: "long", timeStyle: "short" })}</p>
        <p className="mt-1 text-sm text-zinc-400">{String(event.location)}</p>
        <div className="mx-auto mt-8 w-fit rounded-3xl bg-white p-5">
          <QRCodeSVG value={checkinUrl} size={240} marginSize={1} level="H" fgColor="#090909" bgColor="#ffffff" aria-label="Codigo QR de entrada" />
        </div>
        <p className="mt-7 text-base font-bold text-white">{String(data.vehicle || "Vehiculo registrado")}</p>
        <p className="mt-2 text-xs uppercase tracking-wider text-zinc-400">{1 + Number(data.companions || 0)} participantes · 1 coche</p>
        <div className="mt-7 rounded-xl border border-white/10 bg-black/35 p-4 text-sm text-zinc-300">
          {data.checked_in_at ? "Acceso ya validado." : "Presenta este QR al organizador en la entrada."}
        </div>
        <p className="mt-5 text-xs leading-5 text-zinc-500">Guarda este enlace en un lugar seguro. Cualquiera que tenga acceso a esta entrada puede mostrar su QR.</p>
        <Link href="/events" className="mt-7 inline-block text-xs font-bold uppercase tracking-widest text-orange-400 underline">Ver eventos ↗</Link>
      </article>
    </main>
  );
}
