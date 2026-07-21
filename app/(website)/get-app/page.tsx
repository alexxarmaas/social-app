import Link from "next/link";
import { MdPhoneAndroid, MdMap, MdEvent } from "react-icons/md";

export default function GetAppPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-950 to-red-950 px-5 py-20 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <MdPhoneAndroid className="mx-auto text-red-400" size={64} aria-hidden="true" />
        <h1 className="mt-6 text-4xl font-bold sm:text-6xl">Tramassso en tu movil</h1>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-zinc-300">La web está adaptada a móvil y no requiere instalar una aplicación. Consulta eventos y rutas directamente desde el navegador.</p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-black/30 p-7">
            <MdEvent className="mx-auto text-red-400" size={36} aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-semibold">Eventos</h2>
            <p className="mt-3 text-zinc-400">Fechas, ubicaciones y detalles publicados por el equipo.</p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-black/30 p-7">
            <MdMap className="mx-auto text-red-400" size={36} aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-semibold">Rutas</h2>
            <p className="mt-3 text-zinc-400">Trazados, distancias y mapas disponibles.</p>
          </article>
        </div>
        <Link href="/events" className="racing-button mt-10 inline-flex rounded-full px-7 py-3 text-xs font-semibold uppercase tracking-[0.28em]">Explorar eventos</Link>
      </div>
    </main>
  );
}
