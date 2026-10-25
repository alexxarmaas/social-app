import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import { authOptions } from "@/app/lib/auth";
import { createSupabaseServiceClient } from "@/app/lib/supabase";
import RegistrationCancellation from "@/components/events/RegistrationCancellation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mis inscripciones", robots: { index: false, follow: false } };

type UserRegistration = {
  id: string; status: string; vehicle: string | null; created_at: string;
  events: { title: string; date: string; location: string } | Array<{ title: string; date: string; location: string }> | null;
};

export default async function MyEventsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=%2Fmy-events");
  let registrations: UserRegistration[] = [];
  let errorMessage = "";
  const enabled = process.env.EVENT_TICKETING_V2_ENABLED === "true";
  if (enabled) {
    const result = await createSupabaseServiceClient().from("event_registrations")
      .select("id,status,vehicle,created_at,events(title,date,location)")
      .eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(40);
    if (result.error) errorMessage = "No hemos podido cargar las inscripciones.";
    else registrations = (result.data || []) as unknown as UserRegistration[];
  }
  const labels: Record<string, string> = { new: "Pendiente de aprobacion", confirmed: "Confirmada", waitlisted: "Lista de espera", cancelled: "Cancelada" };
  return <main className="min-h-screen bg-zinc-950 px-4 py-14 text-white">
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-400">Area personal</p>
      <h1 className="mt-4 text-4xl font-black uppercase">Mis inscripciones</h1>
      <p className="mt-4 text-sm leading-7 text-zinc-400">Consulta tus solicitudes y cancela una plaza que no puedas utilizar. Las entradas QR confirmadas se envian a tu correo.</p>
      {errorMessage ? <p role="alert" className="mt-8 text-red-300">{errorMessage}</p> : null}
      {!enabled ? <div className="mt-8 rounded-2xl border border-orange-500/20 p-8 text-sm text-zinc-400">Este panel se activa junto a la nueva version de inscripciones. Tus inscripciones anteriores siguen en el sistema del organizador.</div> : null}
      <div className="mt-10 space-y-5">
        {registrations.map((item) => {
          const event = Array.isArray(item.events) ? item.events[0] : item.events;
          return <article key={item.id} className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-orange-400">{labels[item.status] || item.status}</p>
              <h2 className="mt-2 text-xl font-black uppercase">{event?.title || "Evento"}</h2>
              <p className="mt-3 text-sm text-zinc-400">{event ? new Date(event.date).toLocaleString("es-ES", { timeZone: "Atlantic/Canary", dateStyle: "medium", timeStyle: "short" }) : ""}</p>
              <p className="mt-1 text-sm text-zinc-400">{item.vehicle || "Vehiculo no indicado"}</p>
            </div>
            {item.status !== "cancelled" ? <RegistrationCancellation registrationId={item.id} /> : null}
          </article>;
        })}
        {enabled && !registrations.length && !errorMessage ? <p className="rounded-2xl border border-white/10 p-8 text-sm text-zinc-400">No tienes inscripciones vinculadas a tu cuenta. <Link href="/events" className="text-orange-400 underline">Explorar eventos</Link></p> : null}
      </div>
    </div>
  </main>;
}
