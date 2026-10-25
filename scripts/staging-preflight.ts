import { isIsolatedStagingReady } from "../app/lib/staging-guard";

const required = [
  "TRAMASSSO_STAGING_MODE",
  "TRAMASSSO_STAGING_WRITE_ENABLED",
  "TRAMASSSO_STAGING_SUPABASE_REF",
  "DATABASE_URL",
  "DIRECT_URL",
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
] as const;

console.log("Tramassso / Staging preflight (no imprime secretos)");
for (const key of required) {
  console.log((process.env[key] ? "[configured] " : "[missing]    ") + key);
}

if (process.env.TRAMASSSO_STAGING_MODE !== "true") {
  console.error("ERROR: activa TRAMASSSO_STAGING_MODE antes de probar staging.");
  process.exitCode = 1;
} else if (!isIsolatedStagingReady(process.env)) {
  console.error("ERROR: no se ha demostrado aislamiento. Escrituras bloqueadas.");
  process.exitCode = 1;
} else {
  console.log("OK: origen, proyecto Supabase y conexiones PostgreSQL parecen aislados.");
  console.log("ATENCION: verificar ademas el contenido de las claves de servicio y permisos.");
}
