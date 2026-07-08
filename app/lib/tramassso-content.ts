import { z } from "zod";
import { createSupabasePublicClient, createSupabaseServiceClient } from "@/app/lib/supabase";

const urlListSchema = z.array(z.string().url()).default([]);

export const eventInputSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(20).max(5000),
  date: z.string().min(1),
  location: z.string().trim().min(2).max(200),
  cover_image_url: z.string().trim().url().or(z.literal("")).optional(),
  gallery_urls: urlListSchema.optional(),
});

export const routeInputSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(20).max(5000),
  start_point: z.string().trim().min(2).max(200),
  end_point: z.string().trim().min(2).max(200),
  distance_km: z.coerce.number().positive().max(1000),
  drive_time_minutes: z.coerce.number().int().positive().max(1440),
  cover_image_url: z.string().trim().url().or(z.literal("")).optional(),
  gallery_urls: urlListSchema.optional(),
});

export type EventInput = z.infer<typeof eventInputSchema>;
export type RouteInput = z.infer<typeof routeInputSchema>;

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
  created_at: string;
}

export interface EventDetailsRecord extends EventRecord {
  organizer_name: string | null;
}

export interface RouteDetailsRecord extends RouteRecord {
  difficulty: string | null;
  recommended_time: string | null;
}

type ContentKind = "events" | "routes";

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
  created_at: string;
}

function normalizeUrl(value: string | undefined) {
  if (!value) {
    return null;
  }

  return value.length > 0 ? value : null;
}

function normalizeUrlArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value.filter((item): item is string => typeof item === "string");
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
    distance_km: row.distance_km,
    drive_time_minutes: row.drive_time_minutes,
    cover_image_url: row.cover_image_url,
    gallery_urls: row.gallery_urls ?? [],
    created_at: row.created_at,
  };
}

function tableName(kind: ContentKind) {
  return kind === "events" ? "events" : "routes";
}

export async function listPublicEvents() {
  const client = createSupabasePublicClient();
  const { data, error } = await client
    .from("events")
    .select("id,title,description,date,location,cover_image_url,gallery_urls,created_at")
    .order("date", { ascending: true });

  if (error) {
    return { events: [] as EventRecord[], error: error.message };
  }

  return {
    events: (data ?? []).map((row) => mapEventRow(row as EventRow)),
  };
}

export async function getPublicEventById(id: string) {
  const client = createSupabasePublicClient();
  const { data, error } = await client
    .from("events")
    .select("id,title,description,date,location,cover_image_url,gallery_urls,created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return { event: null as EventDetailsRecord | null, error: error?.message ?? "Event not found" };
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
  const { data, error } = await client
    .from("routes")
    .select("id,title,description,start_point,end_point,distance_km,drive_time_minutes,cover_image_url,gallery_urls,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return { routes: [] as RouteRecord[], error: error.message };
  }

  return {
    routes: (data ?? []).map((row) => mapRouteRow(row as RouteRow)),
  };
}

export async function getPublicRouteById(id: string) {
  const client = createSupabasePublicClient();
  const { data, error } = await client
    .from("routes")
    .select("id,title,description,start_point,end_point,distance_km,drive_time_minutes,cover_image_url,gallery_urls,created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return { route: null as RouteDetailsRecord | null, error: error?.message ?? "Route not found" };
  }

  return {
    route: {
      ...mapRouteRow(data as RouteRow),
      difficulty: null,
      recommended_time: null,
    },
  };
}

export async function listAdminContent(kind: "events"): Promise<{ items: EventRecord[]; error?: string }>;
export async function listAdminContent(kind: "routes"): Promise<{ items: RouteRecord[]; error?: string }>;
export async function listAdminContent(kind: ContentKind): Promise<{ items: EventRecord[]; error?: string } | { items: RouteRecord[]; error?: string }>;
export async function listAdminContent(kind: ContentKind): Promise<{ items: EventRecord[]; error?: string } | { items: RouteRecord[]; error?: string }> {
  const client = createSupabasePublicClient();
  const selectColumns =
    kind === "events"
      ? "id,title,description,date,location,cover_image_url,gallery_urls,created_at"
      : "id,title,description,start_point,end_point,distance_km,drive_time_minutes,cover_image_url,gallery_urls,created_at";

  const { data, error } = await client.from(tableName(kind)).select(selectColumns).order("created_at", { ascending: false });

  if (error) {
    return { items: [], error: error.message };
  }

  if (kind === "events") {
    return { items: (data ?? []).map((row) => mapEventRow(row as unknown as EventRow)) as EventRecord[] };
  }

  return { items: (data ?? []).map((row) => mapRouteRow(row as unknown as RouteRow)) as RouteRecord[] };
}

export async function saveContent(kind: ContentKind, payload: unknown, id?: string) {
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
      ? client.from("events").update(row).eq("id", id).select("id,title,description,date,location,cover_image_url,gallery_urls,created_at").single()
      : client.from("events").insert(row).select("id,title,description,date,location,cover_image_url,gallery_urls,created_at").single();

    const { data, error } = await query;

    if (error || !data) {
      return { error: error?.message ?? "Unable to save event" };
    }

    return { item: mapEventRow(data as EventRow) };
  }

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
  };

  const query = id
    ? client.from("routes").update(row).eq("id", id).select("id,title,description,start_point,end_point,distance_km,drive_time_minutes,cover_image_url,gallery_urls,created_at").single()
    : client.from("routes").insert(row).select("id,title,description,start_point,end_point,distance_km,drive_time_minutes,cover_image_url,gallery_urls,created_at").single();

  const { data, error } = await query;

  if (error || !data) {
    return { error: error?.message ?? "Unable to save route" };
  }

  return { item: mapRouteRow(data as RouteRow) };
}

export async function deleteContent(kind: ContentKind, id: string) {
  const client = createSupabaseServiceClient();
  const { error } = await client.from(tableName(kind)).delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export function asEventInput(values: unknown) {
  return eventInputSchema.parse(values);
}

export function asRouteInput(values: unknown) {
  return routeInputSchema.parse(values);
}

export type { ContentKind };