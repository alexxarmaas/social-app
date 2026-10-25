/**
 * A Vercel Preview can inherit production credentials. Fail closed on writes
 * until an independent Supabase project is explicitly configured.
 * This is a deployment safety net, not a replacement for route authorization.
 */
export type StagingEnvironment = Record<string, string | undefined>;
const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const productionSupabaseRef = "fqeoaupcdcrzmziuxxxk";

function databaseBelongsTo(connection: string | undefined, projectRef: string) {
  if (!connection) return false;
  try {
    const url = new URL(connection);
    if (!["postgresql:", "postgres:"].includes(url.protocol)) return false;
    return url.hostname === "db." + projectRef + ".supabase.co"
      || (url.hostname.endsWith(".pooler.supabase.com") && decodeURIComponent(url.username) === "postgres." + projectRef);
  } catch { return false; }
}

export function isIsolatedStagingReady(env: StagingEnvironment) {
  const ref = env.TRAMASSSO_STAGING_SUPABASE_REF?.trim() || "";
  if (env.TRAMASSSO_STAGING_WRITE_ENABLED !== "true") return false;
  if (!/^[a-z]{20}$/.test(ref) || ref === productionSupabaseRef) return false;
  try {
    const api = new URL(env.SUPABASE_URL || "");
    const publicApi = new URL(env.NEXT_PUBLIC_SUPABASE_URL || "");
    const origin = new URL(env.NEXTAUTH_URL || "");
    if (api.protocol !== "https:" || publicApi.protocol !== "https:") return false;
    if (api.hostname !== ref + ".supabase.co" || publicApi.hostname !== api.hostname) return false;
    if (origin.protocol !== "https:" || !origin.hostname.endsWith(".vercel.app")) return false;
    if (!databaseBelongsTo(env.DATABASE_URL, ref) || !databaseBelongsTo(env.DIRECT_URL, ref)) return false;
    if (!env.SUPABASE_SERVICE_ROLE_KEY || !env.NEXTAUTH_SECRET || env.NEXTAUTH_SECRET.length < 32) return false;
    return true;
  } catch { return false; }
}

export function blocksPreviewMutation(method: string, env: StagingEnvironment, pathname = "") {
  if (!unsafeMethods.has(method.toUpperCase()) && !(method.toUpperCase() === "GET" && pathname === "/api/bonoa/sso/start")) return false;
  const staging = env.VERCEL_ENV === "preview" || env.TRAMASSSO_STAGING_MODE === "true";
  return staging && !isIsolatedStagingReady(env);
}
