import { listAdminContent, listContactRequests } from "@/app/lib/tramassso-content";
import AdminEventsManager from "@/components/admin/AdminEventsManager";
import AdminPartnersManager from "@/components/admin/AdminPartnersManager";
import AdminRoutesManager from "@/components/admin/AdminRoutesManager";
import AdminContactRequests from "@/components/admin/AdminContactRequests";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [{ items: events, error: eventsError }, { items: routes, error: routesError }, { items: partners, error: partnersError }, { items: contacts, error: contactsError }] = await Promise.all([
    listAdminContent("events"),
    listAdminContent("routes"),
    listAdminContent("partners"),
    listContactRequests(),
  ]);

  return (
    <div className="mx-auto max-w-[98rem] space-y-6 sm:space-y-7">
      <header className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.25)] sm:rounded-[2rem] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">Panel</p>
            <h2 className="text-balance font-sans text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-5xl">Centro de control de contenido</h2>
            <p className="text-sm leading-7 text-zinc-400">Gestiona eventos, rutas, colaboradores e imagenes desde una interfaz protegida conectada a Supabase y Cloudinary.</p>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-xs uppercase tracking-[0.24em] text-emerald-200">
            Sesion protegida
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Eventos</p>
          <p className="mt-3 font-sans text-4xl font-semibold text-white">{events.length}</p>
          <p className="mt-2 text-xs text-zinc-500">Publicados en Supabase</p>
        </div>
        <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Solicitudes</p>
          <p className="mt-3 font-sans text-4xl font-semibold text-white">{contacts.filter((item) => item.status === "nuevo").length}</p>
          <p className="mt-2 text-xs text-zinc-500">Pendientes de revisar</p>
        </div>
        <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Rutas</p>
          <p className="mt-3 font-sans text-4xl font-semibold text-white">{routes.length}</p>
          <p className="mt-2 text-xs text-zinc-500">Guias disponibles</p>
        </div>
        <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Colaboradores</p>
          <p className="mt-3 font-sans text-4xl font-semibold text-white">{partners.length}</p>
          <p className="mt-2 text-xs text-zinc-500">Directorio publico</p>
        </div>
      </div>

      {eventsError ? <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{eventsError}</p> : null}
      {routesError ? <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{routesError}</p> : null}
      {partnersError ? <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{partnersError}</p> : null}
      {contactsError ? <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{contactsError}</p> : null}

      <nav className="sticky top-3 z-10 flex gap-2 overflow-x-auto rounded-2xl border border-zinc-800 bg-black/75 p-2 backdrop-blur">
        <a href="#admin-events" className="shrink-0 rounded-full border border-zinc-800 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-zinc-300 transition hover:border-white hover:text-white">Eventos</a>
        <a href="#admin-routes" className="shrink-0 rounded-full border border-zinc-800 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-zinc-300 transition hover:border-white hover:text-white">Rutas</a>
        <a href="#admin-partners" className="shrink-0 rounded-full border border-zinc-800 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-zinc-300 transition hover:border-white hover:text-white">Colaboradores</a>
        <a href="#admin-contacts" className="shrink-0 rounded-full border border-zinc-800 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-zinc-300 transition hover:border-white hover:text-white">Solicitudes</a>
      </nav>

      <div id="admin-events" className="scroll-mt-24">
        <AdminEventsManager initialEvents={events} />
      </div>
      <div id="admin-routes" className="scroll-mt-24">
        <AdminRoutesManager initialRoutes={routes} />
      </div>
      <div id="admin-partners" className="scroll-mt-24">
        <AdminPartnersManager initialPartners={partners} />
      </div>
      <div id="admin-contacts" className="scroll-mt-24">
        <AdminContactRequests initialItems={contacts} />
      </div>
    </div>
  );
}
