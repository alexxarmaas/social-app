import { listAdminContent } from "@/app/lib/tramassso-content";
import AdminEventsManager from "@/components/admin/AdminEventsManager";
import AdminPartnersManager from "@/components/admin/AdminPartnersManager";
import AdminRoutesManager from "@/components/admin/AdminRoutesManager";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [{ items: events, error: eventsError }, { items: routes, error: routesError }, { items: partners, error: partnersError }] = await Promise.all([
    listAdminContent("events"),
    listAdminContent("routes"),
    listAdminContent("partners"),
  ]);

  return (
    <div className="mx-auto max-w-[98rem] space-y-6 sm:space-y-7">
      <header className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.25)] sm:rounded-[2rem] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">Panel</p>
            <h2 className="text-balance font-sans text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-5xl">Centro de control de contenido</h2>
            <p className="text-sm leading-7 text-zinc-400">Gestiona eventos, rutas, colaboradores e imágenes desde una interfaz protegida conectada a Supabase y Cloudinary.</p>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-xs uppercase tracking-[0.24em] text-emerald-200">
            Sesión protegida
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Eventos</p>
          <p className="mt-3 font-sans text-4xl font-semibold text-white">{events.length}</p>
          <p className="mt-2 text-xs text-zinc-500">Publicados en Supabase</p>
        </div>
        <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Rutas</p>
          <p className="mt-3 font-sans text-4xl font-semibold text-white">{routes.length}</p>
          <p className="mt-2 text-xs text-zinc-500">Guías disponibles</p>
        </div>
        <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Colaboradores</p>
          <p className="mt-3 font-sans text-4xl font-semibold text-white">{partners.length}</p>
          <p className="mt-2 text-xs text-zinc-500">Directorio público</p>
        </div>
      </div>

      {eventsError ? <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{eventsError}</p> : null}
      {routesError ? <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{routesError}</p> : null}
      {partnersError ? <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{partnersError}</p> : null}

      <AdminEventsManager initialEvents={events} />
      <AdminRoutesManager initialRoutes={routes} />
      <AdminPartnersManager initialPartners={partners} />
    </div>
  );
}
