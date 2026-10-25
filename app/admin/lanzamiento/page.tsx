import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/app/lib/prisma";
import { getCurrentAdminSession } from "@/app/lib/admin-auth";
import { createSupabaseServiceClient } from "@/app/lib/supabase";
import { evaluateLaunch, type LaunchSignals } from "@/app/lib/launch-readiness";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Estado de lanzamiento", robots: { index: false, follow: false } };

type SchemaReadiness = Pick<LaunchSignals,
  "hasPrismaHistory" | "hasAccountToken" | "hasRateLimit" | "hasCarPhoto" |
  "hasPostReport" | "hasTicketColumn" | "hasCommentModeration" | "anonReadsUsers" | "anonDeletesUsers" | "authenticatedEditsCars"
>;

async function inspectSchema(): Promise<SchemaReadiness | null> {
  try {
    const rows = await prisma.$queryRaw<SchemaReadiness[]>`SELECT
      (to_regclass('public._prisma_migrations') IS NOT NULL) AS "hasPrismaHistory",
      (to_regclass('public."AccountToken"') IS NOT NULL) AS "hasAccountToken",
      (to_regclass('public."CommunityRateLimit"') IS NOT NULL) AS "hasRateLimit",
      (to_regclass('public."CarPhoto"') IS NOT NULL) AS "hasCarPhoto",
      (to_regclass('public."PostReport"') IS NOT NULL) AS "hasPostReport",
      EXISTS(SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='Comment'
        AND column_name='status') AS "hasCommentModeration",
      EXISTS(SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='event_registrations'
        AND column_name='ticket_hash') AS "hasTicketColumn",
      has_table_privilege('anon','public."User"','SELECT') AS "anonReadsUsers",
      has_table_privilege('anon','public."User"','DELETE') AS "anonDeletesUsers",
      has_table_privilege('authenticated','public."Car"','UPDATE') AS "authenticatedEditsCars"`;
    return rows[0] ?? null;
  } catch (error) {
    console.error("Launch status inspection failed", error);
    return null;
  }
}

async function safeCount(name: string, callback: () => Promise<number>) {
  try { return await callback(); }
  catch (error) { console.error("Launch metric unavailable: " + name, error); return null; }
}

export default async function LaunchStatusPage() {
  const session = await getCurrentAdminSession();
  if (!session) return null;

  const flags = {
    registrationEnabled: process.env.COMMUNITY_REGISTRATION_ENABLED === "true",
    verificationEnabled: process.env.COMMUNITY_ACCOUNT_VERIFICATION_ENABLED === "true",
    securityEnabled: process.env.COMMUNITY_SECURITY_V2_ENABLED === "true",
    ticketingEnabled: process.env.EVENT_TICKETING_V2_ENABLED === "true",
    socialEnabled: process.env.COMMUNITY_SOCIAL_ENABLED === "true",
    galleryEnabled: process.env.COMMUNITY_GALLERY_ENABLED === "true",
  };
  const [schema, users, cars, clubs, pending, registrations] = await Promise.all([
    inspectSchema(),
    safeCount("accounts", () => prisma.user.count()),
    safeCount("cars", () => prisma.car.count()),
    safeCount("clubs", () => prisma.club.count()),
    flags.socialEnabled ? safeCount("pending posts", () => prisma.post.count({ where: { status: "pending" } })) : Promise.resolve(null),
    (async () => {
      try {
        const response = await createSupabaseServiceClient().from("event_registrations")
          .select("id", { count: "exact", head: true });
        return response.error ? null : response.count;
      } catch (error) { console.error("Registration count unavailable", error); return null; }
    })(),
  ]);
  const findings = schema ? evaluateLaunch({ ...schema, ...flags }) : [];
  const blockers = findings.filter(f => f.severity === "blocker");
  const numbers = [
    ["Cuentas", users], ["Coches", cars], ["Clubes", clubs],
    ["Inscripciones", registrations], ["Pendientes de moderación", pending],
  ] as const;
  const modules = [
    ["Verificación de email", flags.securityEnabled && flags.verificationEnabled],
    ["Registro de usuarios", flags.registrationEnabled],
    ["Eventos y entradas QR", flags.ticketingEnabled],
    ["Comunidad social", flags.socialEnabled],
    ["Galerías de coches", flags.galleryEnabled],
  ] as const;

  return (
    <main className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-400">Operaciones / Tramassso</p>
        <h1 className="mt-4 text-4xl font-black uppercase">Estado de lanzamiento</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
          Datos reales de las bases de datos y configuración del entorno actual. Esta pantalla no ejecuta migraciones ni modifica cuentas.
        </p>
      </header>

      <section aria-label="Datos de actividad" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {numbers.map(([title, value]) => <div key={title} className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</p>
          <p className="mt-4 text-4xl font-black">{value ?? "—"}</p>
        </div>)}
      </section>

      <section className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-black uppercase">Comprobaciones de seguridad y migración</h2>
          <span className="rounded-full border border-orange-500/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-orange-400">
            {!schema ? "No verificable" : blockers.length ? blockers.length + " bloqueos" : "Sin bloqueos de esquema detectados"}
          </span>
        </div>
        {!schema ? <p role="alert" className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-200">
          No se puede inspeccionar el esquema. No considerar listo el lanzamiento.
        </p> : findings.length ? <div className="mt-6 space-y-3">
          {findings.map(f => <div key={f.id} className={"rounded-xl border p-5 " +
            (f.severity === "blocker" ? "border-red-500/30 bg-red-500/[0.06]" : "border-orange-500/20 bg-orange-500/[0.04]")}>
            <p className="text-xs font-bold uppercase tracking-widest">{f.severity === "blocker" ? "Bloqueante" : "Pendiente"} · {f.id}</p>
            <p className="mt-2 text-sm leading-7 text-zinc-400">{f.detail}</p>
          </div>)}
        </div> : <p className="mt-5 text-sm text-zinc-400">
          Sin hallazgos en estas comprobaciones automáticas. Faltan pruebas E2E y revisión legal antes de abrir al público.
        </p>}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 p-7">
          <h2 className="text-xl font-black uppercase">Funciones habilitadas</h2>
          <div className="mt-5 space-y-4">
            {modules.map(([label, enabled]) => <div key={label} className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 text-sm">
              <span>{label}</span>
              <span className={enabled ? "font-semibold text-orange-400" : "text-zinc-500"}>{enabled ? "Activo" : "Desactivado"}</span>
            </div>)}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 p-7">
          <h2 className="text-xl font-black uppercase">Siguientes operaciones</h2>
          <p className="mt-5 text-sm leading-7 text-zinc-400">
            Verificar backup restaurable, reconciliar historial de Prisma, proteger las tablas privadas y aplicar las migraciones de eventos. Después activar los módulos uno por uno, probar el registro, los QR y la moderación antes de difundir el proyecto.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-xl bg-orange-500 px-5 py-3 text-xs font-black uppercase text-black">Gestionar eventos</Link>
            <Link href="/admin/community" className="rounded-xl border border-white/15 px-5 py-3 text-xs font-bold uppercase">Moderar comunidad</Link>
          </div>
        </div>
      </section>
      <p className="text-xs leading-6 text-zinc-500">
        Las comprobaciones no sustituyen una auditoría de seguridad o pruebas manuales. No se exponen credenciales ni información de asistentes.
      </p>
    </main>
  );
}
