import { listAdminContent } from "@/app/lib/tramassso-content";
import AdminEventsManager from "@/components/admin/AdminEventsManager";
import AdminRoutesManager from "@/components/admin/AdminRoutesManager";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [{ items: events, error: eventsError }, { items: routes, error: routesError }] = await Promise.all([
    listAdminContent("events"),
    listAdminContent("routes"),
  ]);

  return (
    <div className="space-y-8">
      <header className="max-w-4xl space-y-4">
        <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Panel</p>
        <h2 className="text-4xl font-black uppercase tracking-[0.1em] text-white md:text-6xl">Centro de control de contenido</h2>
        <p className="text-sm leading-7 text-zinc-400">Gestiona eventos, rutas e imágenes desde una interfaz protegida conectada a Supabase y Cloudinary.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3 xl:max-w-4xl">
        <div className="rounded-3xl border border-zinc-800 bg-white/5 p-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Eventos</p>
          <p className="mt-3 text-3xl font-black text-white">{events.length}</p>
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-white/5 p-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Rutas</p>
          <p className="mt-3 text-3xl font-black text-white">{routes.length}</p>
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-white/5 p-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Imágenes</p>
          <p className="mt-3 text-3xl font-black text-white">Cloudinary</p>
        </div>
      </div>

      {eventsError ? <p className="text-sm text-red-300">{eventsError}</p> : null}
      {routesError ? <p className="text-sm text-red-300">{routesError}</p> : null}

      <AdminEventsManager initialEvents={events} />
      <AdminRoutesManager initialRoutes={routes} />
    </div>
  );
}
