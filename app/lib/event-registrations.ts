import { z } from "zod";
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

export const registrationStatusSchema = z.enum(["new", "confirmed", "cancelled"]);
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
  const { data, error } = await client.from("event_registrations").select("companions").eq("event_id", eventId).neq("status", "cancelled");
  if (error) return { remaining: null as number | null };
  const occupied = (data ?? []).reduce((total, row) => total + 1 + Number(row.companions ?? 0), 0);
  return { remaining: Math.max(0, maximum - occupied) };
}

export async function createEventRegistration(eventId: string, input: unknown) {
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

  if (typedEvent.participation_mode === "managed" && typedEvent.max_participants) {
    const { remaining } = await getEventAvailability(eventId, typedEvent.max_participants);
    if (remaining !== null && remaining < 1 + parsed.companions) return { error: "No quedan plazas suficientes para esta solicitud." };
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
  const { data, error } = await client
    .from("event_registrations")
    .select("id,event_id,participation_mode,name,email,phone,vehicle,license_plate,companions,status,created_at,events(title,date)")
    .order("created_at", { ascending: false });

  if (error) {
    return { items: [], error: migrationError(error.message) ? "Ejecuta la migracion de matriculas para activar esta bandeja." : "No se pudieron cargar las inscripciones." };
  }

  return {
    items: (data ?? []).map((row) => {
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
      };
    }),
  };
}

export async function updateEventRegistration(id: string, status: RegistrationStatus) {
  const client = createSupabaseServiceClient();
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
  const client = createSupabaseServiceClient();
  const { data, error } = await client.from("event_registrations").delete().eq("id", id).select("id").maybeSingle();
  return error || !data ? { error: "No se pudo eliminar la inscripcion." } : { success: true as const };
}
