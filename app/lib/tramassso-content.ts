import { z } from "zod";
import { createSupabasePublicClient, createSupabaseServiceClient } from "@/app/lib/supabase";
import { unstable_cache } from "next/cache";

const httpsUrlSchema = z.string().trim().url("La URL debe ser valida.").refine(
  (value) => URL.canParse(value) && new URL(value).protocol === "https:",
  "La URL debe usar HTTPS.",
);
const imageUrlSchema = httpsUrlSchema.refine(
  (value) => URL.canParse(value) && ["res.cloudinary.com", "images.unsplash.com"].includes(new URL(value).hostname),
  "La imagen debe proceder de Cloudinary o Unsplash.",
);
const urlListSchema = z.array(imageUrlSchema).max(20, "No puedes añadir mas de 20 imagenes.").default([]);
const optionalUrlSchema = httpsUrlSchema.or(z.literal("")).nullish();
const isoDateSchema = z.string().refine(
  (value) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value) && !Number.isNaN(Date.parse(value)),
  "La fecha debe tener un formato ISO valido.",
).transform((value) => new Date(value).toISOString());

export const routeCoordinateSchema = z.object({
  lat: z.coerce.number().min(-90, "La latitud debe estar entre -90 y 90.").max(90, "La latitud debe estar entre -90 y 90."),
  lng: z.coerce.number().min(-180, "La longitud debe estar entre -180 y 180.").max(180, "La longitud debe estar entre -180 y 180."),
});

export type RouteCoordinate = z.infer<typeof routeCoordinateSchema>;

const routeCoordinateListSchema = z.array(routeCoordinateSchema).min(2, "Agrega al menos 2 puntos para mostrar el mapa.");

export const routeCoordinatesSchema = z.unknown().transform((value, context): RouteCoordinate[] | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  let parsedValue: unknown = value;

  if (typeof value === "string") {
    try {
      parsedValue = JSON.parse(value) as unknown;
    } catch {
      context.addIssue({
        code: "custom",
        message: "Las coordenadas deben ser un JSON valido.",
      });
      return z.NEVER;
    }
  }

  const parsed = routeCoordinateListSchema.safeParse(parsedValue);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      context.addIssue({
        code: "custom",
        message: issue.message,
        path: issue.path,
      });
    }
    return z.NEVER;
  }

  return parsed.data;
});

export const eventInputSchema = z.object({
  title: z.string().trim().min(3, "El titulo debe tener al menos 3 caracteres.").max(120, "El titulo no puede superar 120 caracteres."),
  description: z.string().trim().min(20, "La descripcion debe tener al menos 20 caracteres.").max(5000, "La descripcion no puede superar 5000 caracteres."),
  date: isoDateSchema,
  location: z.string().trim().min(2, "Indica la ubicacion.").max(200, "La ubicacion no puede superar 200 caracteres."),
  cover_image_url: imageUrlSchema.or(z.literal("")).optional(),
  gallery_urls: urlListSchema.optional(),
});

export const routeInputSchema = z.object({
  title: z.string().trim().min(3, "El titulo debe tener al menos 3 caracteres.").max(120, "El titulo no puede superar 120 caracteres."),
  description: z.string().trim().min(20, "La descripcion debe tener al menos 20 caracteres.").max(5000, "La descripcion no puede superar 5000 caracteres."),
  start_point: z.string().trim().min(2, "Indica el punto de salida.").max(200, "El punto de salida no puede superar 200 caracteres."),
  end_point: z.string().trim().min(2, "Indica el punto de llegada.").max(200, "El punto de llegada no puede superar 200 caracteres."),
  distance_km: z.coerce.number().positive("La distancia debe ser mayor que 0.").max(1000, "La distancia no puede superar 1000 km."),
  drive_time_minutes: z.coerce.number().int("El tiempo debe ser un numero entero.").positive("El tiempo debe ser mayor que 0.").max(1440, "El tiempo no puede superar 1440 minutos."),
  cover_image_url: imageUrlSchema.or(z.literal("")).optional(),
  gallery_urls: urlListSchema.optional(),
  coordinates: routeCoordinatesSchema.optional(),
});

export const partnerInputSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(120, "El nombre no puede superar 120 caracteres."),
  category: z.string().trim().min(2, "Indica la categoria.").max(80, "La categoria no puede superar 80 caracteres."),
  logo_url: imageUrlSchema.or(z.literal("")).nullish(),
  website_url: optionalUrlSchema,
  description: z.string().trim().max(1000, "La descripcion no puede superar 1000 caracteres.").or(z.literal("")).nullish(),
  is_featured: z.coerce.boolean().default(false),
});

export type EventInput = z.infer<typeof eventInputSchema>;
export type RouteInput = z.infer<typeof routeInputSchema>;
export type PartnerInput = z.infer<typeof partnerInputSchema>;

export interface EventRecord {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  cover_image_url: string | null;
  gallery_urls: string[];
  created_at: string;
}

export interface RouteRecord {
  id: string;
  title: string;
  description: string;
  start_point: string;
  end_point: string;
  distance_km: number;
  drive_time_minutes: number;
  cover_image_url: string | null;
  gallery_urls: string[];
  coordinates: RouteCoordinate[] | null;
  created_at: string;
}

export interface PartnerRecord {
  id: string;
  name: string;
  category: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface EventDetailsRecord extends EventRecord {
  organizer_name: string | null;
}

export interface RouteDetailsRecord extends RouteRecord {
  difficulty: string | null;
  recommended_time: string | null;
}

export type ContentKind = "events" | "routes" | "partners";

interface EventRow {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  cover_image_url: string | null;
  gallery_urls: string[] | null;
  created_at: string;
}

interface RouteRow {
  id: string;
  title: string;
  description: string;
  start_point: string;
  end_point: string;
  distance_km: number;
  drive_time_minutes: number;
  cover_image_url: string | null;
  gallery_urls: string[] | null;
  coordinates?: unknown;
  created_at: string;
}

interface PartnerRow {
  id: string;
  name: string;
  category: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  is_featured: boolean;
  created_at: string;
}

function normalizeUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return value.length > 0 ? value : null;
}

function normalizeNullableText(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return value.trim().length > 0 ? value.trim() : null;
}

function normalizeUrlArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value.filter((item): item is string => typeof item === "string" && item.startsWith("https://"));
}

function normalizeCoordinates(value: unknown): RouteCoordinate[] | null {
  const parsed = routeCoordinatesSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function mapEventRow(row: EventRow): EventRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
    location: row.location,
    cover_image_url: row.cover_image_url,
    gallery_urls: row.gallery_urls ?? [],
    created_at: row.created_at,
  };
}

function mapRouteRow(row: RouteRow): RouteRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    start_point: row.start_point,
    end_point: row.end_point,
    distance_km: Number(row.distance_km),
    drive_time_minutes: Number(row.drive_time_minutes),
    cover_image_url: row.cover_image_url,
    gallery_urls: row.gallery_urls ?? [],
    coordinates: normalizeCoordinates(row.coordinates),
    created_at: row.created_at,
  };
}

function mapPartnerRow(row: PartnerRow): PartnerRecord {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    logo_url: row.logo_url,
    website_url: row.website_url,
    description: row.description,
    is_featured: row.is_featured,
    created_at: row.created_at,
  };
}

function tableName(kind: ContentKind) {
  if (kind === "events") {
    return "events";
  }

  return kind === "routes" ? "routes" : "partners";
}

function contentKindLabel(kind: ContentKind) {
  if (kind === "events") {
    return "eventos";
  }

  return kind === "routes" ? "rutas" : "colaboradores";
}

function formatSupabaseError(kind: ContentKind, error: { message?: string; code?: string }) {
  const message = error.message ?? "Error de Supabase";

  if (kind === "routes" && isMissingCoordinatesColumnError(error)) {
    return "Falta la columna de coordenadas en Supabase. Ejecuta supabase/partners-and-route-coordinates.sql para activar mapas de rutas.";
  }

  if (message.includes("schema cache") || message.includes(`public.${tableName(kind)}`) || error.code === "PGRST205") {
    return `No existe la tabla de ${contentKindLabel(kind)} en Supabase. Ejecuta la SQL indicada en la documentacion y vuelve a intentarlo.`;
  }

  return "No se pudo completar la operacion con el servicio de contenido.";
}

const eventColumns = "id,title,description,date,location,cover_image_url,gallery_urls,created_at";
const routeColumns = "id,title,description,start_point,end_point,distance_km,drive_time_minutes,cover_image_url,gallery_urls,coordinates,created_at";
const routeColumnsWithoutCoordinates = "id,title,description,start_point,end_point,distance_km,drive_time_minutes,cover_image_url,gallery_urls,created_at";
const partnerColumns = "id,name,category,logo_url,website_url,description,is_featured,created_at";

function isMissingCoordinatesColumnError(error: { message?: string; code?: string }) {
  const message = error.message ?? "";
  return message.includes("routes.coordinates") || message.includes("column routes.coordinates does not exist") || message.includes("Could not find the 'coordinates' column");
}

export async function listPublicEvents() {
  const client = createSupabasePublicClient();
  const { data, error } = await client.from("events").select(eventColumns).gte("date", new Date().toISOString()).order("date", { ascending: true });

  if (error) {
    return { events: [] as EventRecord[], error: formatSupabaseError("events", error) };
  }

  return {
    events: (data ?? []).map((row) => mapEventRow(row as EventRow)),
  };
}

export async function getPublicEventById(id: string) {
  const client = createSupabasePublicClient();
  const { data, error } = await client.from("events").select(eventColumns).eq("id", id).maybeSingle();

  if (error || !data) {
    return { event: null as EventDetailsRecord | null, error: error ? formatSupabaseError("events", error) : "Evento no encontrado" };
  }

  return {
    event: {
      ...mapEventRow(data as EventRow),
      organizer_name: null,
    },
  };
}

export async function listPublicRoutes() {
  const client = createSupabasePublicClient();
  const { data, error } = await client.from("routes").select(routeColumns).order("created_at", { ascending: false });

  if (error) {
    if (isMissingCoordinatesColumnError(error)) {
      const fallback = await client.from("routes").select(routeColumnsWithoutCoordinates).order("created_at", { ascending: false });

      if (!fallback.error) {
        return {
          routes: (fallback.data ?? []).map((row) => mapRouteRow(row as RouteRow)),
        };
      }
    }

    return { routes: [] as RouteRecord[], error: formatSupabaseError("routes", error) };
  }

  return {
    routes: (data ?? []).map((row) => mapRouteRow(row as RouteRow)),
  };
}

export async function getPublicRouteById(id: string) {
  const client = createSupabasePublicClient();
  const { data, error } = await client.from("routes").select(routeColumns).eq("id", id).maybeSingle();

  if (error || !data) {
    if (error && isMissingCoordinatesColumnError(error)) {
      const fallback = await client.from("routes").select(routeColumnsWithoutCoordinates).eq("id", id).maybeSingle();

      if (!fallback.error && fallback.data) {
        return {
          route: {
            ...mapRouteRow(fallback.data as RouteRow),
            difficulty: null,
            recommended_time: null,
          },
        };
      }
    }

    return { route: null as RouteDetailsRecord | null, error: error ? formatSupabaseError("routes", error) : "Ruta no encontrada" };
  }

  return {
    route: {
      ...mapRouteRow(data as RouteRow),
      difficulty: null,
      recommended_time: null,
    },
  };
}

export async function listPublicPartners() {
  const client = createSupabasePublicClient();
  const { data, error } = await client
    .from("partners")
    .select(partnerColumns)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return { partners: [] as PartnerRecord[], error: formatSupabaseError("partners", error) };
  }

  return {
    partners: (data ?? []).map((row) => mapPartnerRow(row as PartnerRow)),
  };
}

export async function getPublicPartner(id: string) {
  const client = createSupabasePublicClient();
  const { data, error } = await client.from("partners").select(partnerColumns).eq("id", id).maybeSingle();

  if (error || !data) {
    return { partner: null as PartnerRecord | null, error: error ? formatSupabaseError("partners", error) : "Colaborador no encontrado" };
  }

  return { partner: mapPartnerRow(data as PartnerRow) };
}

export async function listAdminContent(kind: "events"): Promise<{ items: EventRecord[]; error?: string }>;
export async function listAdminContent(kind: "routes"): Promise<{ items: RouteRecord[]; error?: string }>;
export async function listAdminContent(kind: "partners"): Promise<{ items: PartnerRecord[]; error?: string }>;
export async function listAdminContent(kind: ContentKind): Promise<{ items: EventRecord[] | RouteRecord[] | PartnerRecord[]; error?: string }>;
export async function listAdminContent(kind: ContentKind): Promise<{ items: EventRecord[] | RouteRecord[] | PartnerRecord[]; error?: string }> {
  const client = createSupabasePublicClient();
  const selectColumns = kind === "events" ? eventColumns : kind === "routes" ? routeColumns : partnerColumns;
  const orderColumn = kind === "events" ? "date" : "created_at";
  let query = client.from(tableName(kind)).select(selectColumns);

  if (kind === "partners") {
    query = query.order("is_featured", { ascending: false });
  }

  const { data, error } = await query.order(orderColumn, { ascending: false });

  if (error) {
    if (kind === "routes" && isMissingCoordinatesColumnError(error)) {
      const fallback = await client.from("routes").select(routeColumnsWithoutCoordinates).order("created_at", { ascending: false });

      if (!fallback.error) {
        return {
          items: (fallback.data ?? []).map((row) => mapRouteRow(row as unknown as RouteRow)),
          error: formatSupabaseError(kind, error),
        };
      }
    }

    return { items: [], error: formatSupabaseError(kind, error) };
  }

  if (kind === "events") {
    return { items: (data ?? []).map((row) => mapEventRow(row as unknown as EventRow)) };
  }

  if (kind === "routes") {
    return { items: (data ?? []).map((row) => mapRouteRow(row as unknown as RouteRow)) };
  }

  return { items: (data ?? []).map((row) => mapPartnerRow(row as unknown as PartnerRow)) };
}

export async function saveContent(kind: "events", payload: unknown, id?: string): Promise<{ item: EventRecord } | { error: string }>;
export async function saveContent(kind: "routes", payload: unknown, id?: string): Promise<{ item: RouteRecord } | { error: string }>;
export async function saveContent(kind: "partners", payload: unknown, id?: string): Promise<{ item: PartnerRecord } | { error: string }>;
export async function saveContent(kind: ContentKind, payload: unknown, id?: string): Promise<{ item: EventRecord | RouteRecord | PartnerRecord } | { error: string }>;
export async function saveContent(kind: ContentKind, payload: unknown, id?: string): Promise<{ item: EventRecord | RouteRecord | PartnerRecord } | { error: string }> {
  const client = createSupabaseServiceClient();

  if (kind === "events") {
    const parsed = eventInputSchema.parse(payload);
    const row = {
      title: parsed.title,
      description: parsed.description,
      date: parsed.date,
      location: parsed.location,
      cover_image_url: normalizeUrl(parsed.cover_image_url),
      gallery_urls: normalizeUrlArray(parsed.gallery_urls),
    };

    const query = id
      ? client.from("events").update(row).eq("id", id).select(eventColumns).single()
      : client.from("events").insert(row).select(eventColumns).single();

    const { data, error } = await query;

    if (error || !data) {
      return { error: error ? formatSupabaseError("events", error) : "No se pudo guardar el evento" };
    }

    return { item: mapEventRow(data as EventRow) };
  }

  if (kind === "routes") {
    const parsed = routeInputSchema.parse(payload);
    const row = {
      title: parsed.title,
      description: parsed.description,
      start_point: parsed.start_point,
      end_point: parsed.end_point,
      distance_km: parsed.distance_km,
      drive_time_minutes: parsed.drive_time_minutes,
      cover_image_url: normalizeUrl(parsed.cover_image_url),
      gallery_urls: normalizeUrlArray(parsed.gallery_urls),
      coordinates: parsed.coordinates ?? null,
    };

    const query = id
      ? client.from("routes").update(row).eq("id", id).select(routeColumns).single()
      : client.from("routes").insert(row).select(routeColumns).single();

    const { data, error } = await query;

    if (error || !data) {
      if (error && isMissingCoordinatesColumnError(error)) {
        if (parsed.coordinates) {
          return { error: formatSupabaseError("routes", error) };
        }

        const rowWithoutCoordinates = {
          title: parsed.title,
          description: parsed.description,
          start_point: parsed.start_point,
          end_point: parsed.end_point,
          distance_km: parsed.distance_km,
          drive_time_minutes: parsed.drive_time_minutes,
          cover_image_url: normalizeUrl(parsed.cover_image_url),
          gallery_urls: normalizeUrlArray(parsed.gallery_urls),
        };

        const fallbackQuery = id
          ? client.from("routes").update(rowWithoutCoordinates).eq("id", id).select(routeColumnsWithoutCoordinates).single()
          : client.from("routes").insert(rowWithoutCoordinates).select(routeColumnsWithoutCoordinates).single();

        const fallback = await fallbackQuery;

        if (!fallback.error && fallback.data) {
          return { item: mapRouteRow(fallback.data as RouteRow) };
        }
      }

      return { error: error ? formatSupabaseError("routes", error) : "No se pudo guardar la ruta" };
    }

    return { item: mapRouteRow(data as RouteRow) };
  }

  const parsed = partnerInputSchema.parse(payload);
  const row = {
    name: parsed.name,
    category: parsed.category,
    logo_url: normalizeUrl(parsed.logo_url),
    website_url: normalizeUrl(parsed.website_url),
    description: normalizeNullableText(parsed.description),
    is_featured: parsed.is_featured,
  };

  const query = id
    ? client.from("partners").update(row).eq("id", id).select(partnerColumns).single()
    : client.from("partners").insert(row).select(partnerColumns).single();

  const { data, error } = await query;

  if (error || !data) {
    return { error: error ? formatSupabaseError("partners", error) : "No se pudo guardar el colaborador" };
  }

  return { item: mapPartnerRow(data as PartnerRow) };
}

export async function savePartner(input: unknown, id?: string) {
  return saveContent("partners", input, id);
}

export async function deleteContent(kind: ContentKind, id: string) {
  const client = createSupabaseServiceClient();
  const { data, error } = await client.from(tableName(kind)).delete().eq("id", id).select("id").maybeSingle();

  if (error) {
    return { error: formatSupabaseError(kind, error) };
  }

  if (!data) {
    return { error: "El contenido no existe o ya fue eliminado." };
  }

  return { success: true };
}

export async function deletePartner(id: string) {
  return deleteContent("partners", id);
}

export function asEventInput(values: unknown) {
  return eventInputSchema.parse(values);
}

export function asRouteInput(values: unknown) {
  return routeInputSchema.parse(values);
}

export function asPartnerInput(values: unknown) {
  return partnerInputSchema.parse(values);
}

async function readPublicStats() {
  const client = createSupabasePublicClient();

  const [
    { count: eventsCount },
    { count: routesCount },
    { count: partnersCount }
  ] = await Promise.all([
    client.from("events").select("*", { count: "exact", head: true }),
    client.from("routes").select("*", { count: "exact", head: true }),
    client.from("partners").select("*", { count: "exact", head: true })
  ]);

  return {
    events: eventsCount ?? 0,
    routes: routesCount ?? 0,
    partners: partnersCount ?? 0,
  };
}

export const getPublicStats = unstable_cache(readPublicStats, ["public-stats"], { revalidate: 300 });
