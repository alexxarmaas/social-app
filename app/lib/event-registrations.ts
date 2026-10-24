import { z } from "zod";
import { createHash, randomBytes } from "node:crypto";
import { communityOrigin } from "@/app/lib/community-security";
import { createSupabaseServiceClient } from "@/app/lib/supabase";
import { participationModeSchema, type ParticipationMode } from "@/app/lib/tramassso-content";

export function normalizeLicensePlate(value: string) {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (/^\d{4}[A-Z]{3}$/.test(compact)) {
    return `${compact.slice(0, 4)} ${compact.slice(4)}`;
  }
  return compact;
}

export const registrationInputSchema = z.object({
  name: z.string().trim().min(2, "Indica tu nombre.").max(120),
  email: z.string().trim().email("Indica un correo valido.").max(160),
  phone: z.string().trim().max(40).or(z.literal("")).optional(),
  vehicle: z.string().trim().min(2, "Indica la marca y el modelo del vehiculo.").max(160),
  license_plate: z.string()
    .trim()
    .min(4, "Indica la matricula del vehiculo.")
    .max(16, "La matricula no puede superar 16 caracteres.")
    .transform(normalizeLicensePlate)
    .refine((value) => value.length >= 4, "Indica una matricula valida."),
  companions: z.coerce.number().int().min(0).max(20).default(0),
  privacy: z.literal(true, { error: "Debes aceptar la politica de privacidad." }),
  website: z.string().max(200).optional(),
});

export const registrationStatusSchema = z.enum(["new", "confirmed", "cancelled", "waitlisted"]);
export type RegistrationInput = z.infer<typeof registrationInputSchema>;
export type RegistrationStatus = z.infer<typeof registrationStatusSchema>;

export interface EventRegistrationRecord {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  participation_mode: "interest" | "managed";
  name: string;
  email: string;
  phone: string | null;
  vehicle: string;
  license_plate: string;
  companions: number;
  status: RegistrationStatus;
  created_at: string;
  checked_in_at?: string | null;
}

interface RegistrationEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  participation_mode: ParticipationMode;
  max_participants: number | null;
}

function nullable(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function migrationError(message?: string) {
  return message?.includes("event_registrations") || message?.includes("participation_mode") || message?.includes("license_plate") || message?.includes("schema cache");
}

export async function getEventAvailability(eventId: string, maximum: number | null) {
  if (!maximum) return { remaining: null as number | null };
  const client = createSupabaseServiceClient();
  const { count, error } = await client
    .from("event_registrations")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .in("status", ["new", "confirmed"]);
  if (error) return { remaining: null as number | null };
  return { remaining: Math.max(0, maximum - (count ?? 0)) };
}

export async function createEventRegistration(eventId: string, input: unknown, userId?: string) {
  const parsed = registrationInputSchema.parse(input);
  if (parsed.website) return { success: true as const, notification: null };

  const client = createSupabaseServiceClient();
  const { data: event, error: eventError } = await client
    .from("events")
    .select("id,title,date,location,participation_mode,max_participants")
    .eq("id", eventId)
    .maybeSingle();

  if (eventError || !event) {
    return { error: migrationError(eventError?.message) ? "Activa primero la migracion de inscripciones en Supabase." : "El evento no existe." };
  }

  const typedEvent = event as RegistrationEvent;
  if (typedEvent.participation_mode !== "interest" && typedEvent.participation_mode !== "managed") {
    return { error: "Este evento no admite solicitudes desde Tramassso." };
  }
  if (Date.parse(typedEvent.date) < Date.now()) return { error: "El evento ya ha finalizado." };

  if (process.env.EVENT_TICKETING_V2_ENABLED === "true") {
    const { data, error } = await client.rpc("trm_register_event_v2", {
      p_event_id: eventId,
      p_name: parsed.name,
      p_email: parsed.email,
      p_phone: parsed.phone || "",
      p_vehicle: parsed.vehicle,
      p_license_plate: parsed.license_plate,
      p_companions: parsed.companions,
      p_user_id: userId || null,
    });
    if (error) {
      console.error("Atomic registration RPC failed", error.code);
      return { error: "No se pudo tramitar la solicitud. Comprueba la migracion de eventos v2." };
    }
    const result = data as { success?: boolean; error?: string; registrationId?: string; status?: "new" | "waitlisted" };
    if (!result?.success) return { error: result?.error || "No se pudo registrar la solicitud." };
    return {
      success: true as const, registrationId: result.registrationId,
      status: result.status, event: typedEvent, input: parsed,
    };
  }

  if (typedEvent.participation_mode === "managed" && typedEvent.max_participants) {
    const { remaining } = await getEventAvailability(eventId, typedEvent.max_participants);
    if (remaining !== null && remaining < 1) return { error: "No quedan plazas disponibles para nuevas inscripciones." };
  }

  const { data: existingPlate, error: plateLookupError } = await client
    .from("event_registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("license_plate", parsed.license_plate)
    .neq("status", "cancelled")
    .maybeSingle();

  if (plateLookupError) {
    return { error: migrationError(plateLookupError.message) ? "Activa primero la migracion de matriculas en Supabase." : "No se pudo comprobar la matricula." };
  }
  if (existingPlate) {
    return { error: "Esta matricula ya tiene una solicitud activa para este evento." };
  }

  const { data, error } = await client.from("event_registrations").insert({
    event_id: eventId,
    participation_mode: typedEvent.participation_mode,
    name: parsed.name,
    email: parsed.email.toLowerCase(),
    phone: nullable(parsed.phone),
    vehicle: parsed.vehicle,
    license_plate: parsed.license_plate,
    companions: parsed.companions,
    privacy_accepted_at: new Date().toISOString(),
  }).select("id").single();

  if (error) {
    if (error.code === "23505") {
      if (error.message.includes("license_plate") || error.message.includes("plate")) {
        return { error: "Esta matricula ya tiene una solicitud activa para este evento." };
      }
      return { error: "Este correo ya figura en la lista del evento." };
    }
    return { error: migrationError(error.message) ? "Activa primero la migracion de matriculas en Supabase." : "No se pudo guardar la solicitud." };
  }

  return { success: true as const, registrationId: data.id as string, event: typedEvent, input: parsed };
}

export async function listEventRegistrations(): Promise<{ items: EventRegistrationRecord[]; error?: string }> {
  const client = createSupabaseServiceClient();
  const columns = process.env.EVENT_TICKETING_V2_ENABLED === "true"
    ? "id,event_id,participation_mode,name,email,phone,vehicle,license_plate,companions,status,created_at,checked_in_at,events(title,date)"
    : "id,event_id,participation_mode,name,email,phone,vehicle,license_plate,companions,status,created_at,events(title,date)";
  const { data, error } = await client
    .from("event_registrations")
    .select(columns)
    .order("created_at", { ascending: false });

  if (error) {
    return { items: [], error: migrationError(error.message) ? "Ejecuta la migracion de matriculas para activar esta bandeja." : "No se pudieron cargar las inscripciones." };
  }

  type RegistrationRow = {
    id: unknown; event_id: unknown; participation_mode: unknown;
    name: unknown; email: unknown; phone: unknown; vehicle: unknown;
    license_plate: unknown; companions: unknown; status: unknown;
    created_at: unknown; checked_in_at?: unknown;
    events?: { title?: string; date?: string } | Array<{ title?: string; date?: string }> | null;
  };
  const typedRows = (data ?? []) as unknown as RegistrationRow[];
  return {
    items: typedRows.map((row) => {
      const related = Array.isArray(row.events) ? row.events[0] : row.events;
      return {
        id: String(row.id),
        event_id: String(row.event_id),
        event_title: related?.title ?? "Evento eliminado",
        event_date: related?.date ?? "",
        participation_mode: participationModeSchema.parse(row.participation_mode) as "interest" | "managed",
        name: String(row.name),
        email: String(row.email),
        phone: row.phone ? String(row.phone) : null,
        vehicle: row.vehicle ? String(row.vehicle) : "Sin datos históricos",
        license_plate: row.license_plate ? String(row.license_plate) : "Sin datos históricos",
        companions: Number(row.companions),
        status: registrationStatusSchema.parse(row.status),
        created_at: String(row.created_at),
        checked_in_at: "checked_in_at" in row && row.checked_in_at ? String(row.checked_in_at) : null,
      };
    }),
  };
}

export async function updateEventRegistration(id: string, status: RegistrationStatus) {
  const client = createSupabaseServiceClient();
  if (process.env.EVENT_TICKETING_V2_ENABLED === "true") {
    if (status === "waitlisted") return { error: "La lista de espera se gestiona automaticamente." };
    const origin = communityOrigin();
    if (status === "confirmed" && !origin) return { error: "Falta configurar NEXTAUTH_URL para emitir entradas." };
    const ticket = status === "confirmed" ? randomBytes(32).toString("base64url") : null;
    const ticketHash = ticket ? createHash("sha256").update(ticket).digest("hex") : null;
    const { data: changed, error: rpcError } = await client.rpc("trm_set_event_status_v2", {
      p_registration_id: id, p_status: status, p_ticket_hash: ticketHash,
    });
    if (rpcError) return { error: "No se pudo cambiar el estado. Verifica la migracion de eventos v2." };
    const result = changed as { success?: boolean; error?: string; promotedId?: string | null };
    if (!result?.success) return { error: result?.error || "No se pudo cambiar el estado." };
    const { data } = await client.from("event_registrations")
      .select("id,name,email,events(title,date,location)").eq("id", id).maybeSingle();
    const related = data && (Array.isArray(data.events) ? data.events[0] : data.events);
    return {
      success: true as const,
      promotedId: result.promotedId || null,
      notification: data && related ? {
        name: String(data.name), email: String(data.email), status,
        event_title: String(related.title), event_date: String(related.date),
        event_location: String(related.location),
        ticket_url: ticket && origin ? new URL("/tickets/" + ticket, origin).toString() : undefined,
      } : null,
    };
  }
  const { data, error } = await client.from("event_registrations").update({ status }).eq("id", id).select("id,name,email,events(title,date,location)").maybeSingle();
  if (error || !data) return { error: "No se pudo actualizar la inscripcion." };
  const related = Array.isArray(data.events) ? data.events[0] : data.events;
  return {
    success: true as const,
    notification: related ? {
      name: String(data.name),
      email: String(data.email),
      status,
      event_title: String(related.title),
      event_date: String(related.date),
      event_location: String(related.location),
    } : null,
  };
}

export async function deleteEventRegistration(id: string) {
  if (process.env.EVENT_TICKETING_V2_ENABLED === "true") {
    return { error: "Cancela la inscripcion en lugar de eliminarla para mantener correctamente la lista de espera." };
  }
  const client = createSupabaseServiceClient();
  const { data, error } = await client.from("event_registrations").delete().eq("id", id).select("id").maybeSingle();
  return error || !data ? { error: "No se pudo eliminar la inscripcion." } : { success: true as const };
}
