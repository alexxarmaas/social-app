import { getPublicStats } from "@/app/lib/tramassso-content";
import { getVercelStats } from "@/app/lib/vercel-analytics";
import { MdOutlineAnalytics, MdDirectionsCar, MdOutlineHandshake, MdMap, MdShowChart, MdPeople } from "react-icons/md";

export default async function WebsiteFooter() {
  const [stats, vercelStats] = await Promise.all([
    getPublicStats(),
    getVercelStats()
  ]);

  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 px-4 py-12 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-2">
          <p className="racing-eyebrow text-[10px] uppercase tracking-[0.4em] text-zinc-500">Dashboard de la Plataforma</p>
          <h2 className="text-xl font-bold uppercase tracking-[0.05em] text-white">Transparencia Total</h2>
          <p className="text-sm text-zinc-400">Datos publicos de la comunidad y analiticas directas de Vercel (ultimos 30 dias).</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Platform Stats */}
          <div className="racing-card rounded-2xl border border-zinc-800 p-4 sm:p-5">
            <MdDirectionsCar className="text-red-400" size={20} />
            <p className="mt-4 text-3xl font-black text-white">{stats.events}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Eventos</p>
          </div>
          <div className="racing-card rounded-2xl border border-zinc-800 p-4 sm:p-5">
            <MdMap className="text-red-400" size={20} />
            <p className="mt-4 text-3xl font-black text-white">{stats.routes}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Rutas Trazadas</p>
          </div>
          <div className="racing-card rounded-2xl border border-zinc-800 p-4 sm:p-5">
            <MdOutlineHandshake className="text-red-400" size={20} />
            <p className="mt-4 text-3xl font-black text-white">{stats.partners}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Marcas Activas</p>
          </div>

          {/* Vercel Stats */}
          {vercelStats ? (
            <>
              <div className="racing-card rounded-2xl border border-zinc-800 bg-black/40 p-4 sm:p-5">
                <MdPeople className="text-blue-400" size={20} />
                <p className="mt-4 text-3xl font-black text-white">{vercelStats.visitors.toLocaleString("es-ES")}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Visitantes</p>
              </div>
              <div className="racing-card rounded-2xl border border-zinc-800 bg-black/40 p-4 sm:p-5">
                <MdShowChart className="text-blue-400" size={20} />
                <p className="mt-4 text-3xl font-black text-white">{vercelStats.pageviews.toLocaleString("es-ES")}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Paginas Vistas</p>
              </div>
            </>
          ) : (
            <div className="racing-card col-span-1 flex flex-col justify-center rounded-2xl border border-zinc-800 bg-black/20 p-4 sm:col-span-2 sm:p-5">
              <MdOutlineAnalytics className="text-zinc-600" size={20} />
              <p className="mt-3 text-sm text-zinc-400">Analiticas de Vercel no configuradas.</p>
              <p className="mt-1 text-xs text-zinc-600">Agrega VERCEL_TOKEN y VERCEL_PROJECT_ID en las variables de entorno.</p>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
