import { z } from "zod";
import { createSupabasePublicClient, createSupabaseServiceClient } from "@/app/lib/supabase";

export const partnerIdSchema = z.string().uuid("El identificador del colaborador no es valido.");

export const partnerServiceInputSchema = z.object({
  name: z.string().trim().min(2, "El servicio debe tener al menos 2 caracteres.").max(100, "El servicio no puede superar 100 caracteres."),
  description: z.string().trim().max(500, "La descripcion del servicio no puede superar 500 caracteres.").or(z.literal("")).nullish(),
});

export const partnerServiceListInputSchema = z.array(partnerServiceInputSchema).max(12, "No puedes añadir mas de 12 servicios.").default([]);

export type PartnerServiceInput = z.infer<typeof partnerServiceInputSchema>;

export interface PartnerServiceRecord {
  id: string;
  partner_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

interface PartnerServiceRow {
  id: string;
  partner_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

const partnerServiceColumns = "id,partner_id,name,description,sort_order,created_at";

function mapPartnerServiceRow(row: PartnerServiceRow): PartnerServiceRecord {
  return {
    id: row.id,
    partner_id: row.partner_id,
    name: row.name,
    description: row.description,
    sort_order: Number(row.sort_order),
    created_at: row.created_at,
  };
}

function isMissingPartnerServicesError(error: { message?: string; code?: string }) {
  const message = error.message ?? "";
  return error.code === "PGRST205"
    || message.includes("public.partner_services")
    || message.includes("partner_services")
    || message.includes("replace_partner_services");
}

function formatPartnerServicesError(error: { message?: string; code?: string }) {
  if (isMissingPartnerServicesError(error)) {
    return "Falta la funcion de servicios de colaboradores en Supabase. Ejecuta supabase/migrations/20260722_partner_services.sql y vuelve a intentarlo.";
  }

  return "No se pudieron cargar o guardar los servicios del colaborador.";
}

export async function listPublicPartnerServices(partnerId: string): Promise<{ services: PartnerServiceRecord[]; error?: string }> {
  const parsedPartnerId = partnerIdSchema.safeParse(partnerId);
  if (!parsedPartnerId.success) {
    return { services: [], error: parsedPartnerId.error.issues[0]?.message };
  }

  const client = createSupabasePublicClient();
  const { data, error } = await client
    .from("partner_services")
    .select(partnerServiceColumns)
    .eq("partner_id", parsedPartnerId.data)
    .order("sort_order", { ascending: true });

  if (error) {
    return { services: [], error: formatPartnerServicesError(error) };
  }

  return { services: (data ?? []).map((row) => mapPartnerServiceRow(row as PartnerServiceRow)) };
}

export async function listAdminPartnerServices(partnerId: string) {
  const parsedPartnerId = partnerIdSchema.parse(partnerId);
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("partner_services")
    .select(partnerServiceColumns)
    .eq("partner_id", parsedPartnerId)
    .order("sort_order", { ascending: true });

  if (error) {
    return { services: [] as PartnerServiceRecord[], error: formatPartnerServicesError(error) };
  }

  return { services: (data ?? []).map((row) => mapPartnerServiceRow(row as PartnerServiceRow)) };
}

export async function replacePartnerServices(partnerId: string, input: unknown) {
  const parsedPartnerId = partnerIdSchema.parse(partnerId);
  const parsedServices = partnerServiceListInputSchema.parse(input);
  const serviceItems = parsedServices.map((service) => ({
    name: service.name,
    description: service.description?.trim() || null,
  }));

  const client = createSupabaseServiceClient();
  const { data, error } = await client.rpc("replace_partner_services", {
    target_partner_id: parsedPartnerId,
    service_items: serviceItems,
  });

  if (error) {
    return { services: [] as PartnerServiceRecord[], error: formatPartnerServicesError(error) };
  }

  return {
    services: ((data ?? []) as PartnerServiceRow[])
      .map(mapPartnerServiceRow)
      .sort((left, right) => left.sort_order - right.sort_order),
  };
}
