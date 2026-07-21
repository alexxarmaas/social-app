import Link from "next/link";

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-5 text-center text-white"><div><p className="racing-eyebrow text-xs uppercase tracking-[0.45em]">Error 404</p><h1 className="mt-4 text-5xl font-black uppercase">Te saliste de la ruta</h1><p className="mt-4 text-zinc-400">Esta página no existe o ya no está disponible.</p><Link href="/" className="racing-button mt-7 inline-flex rounded-full px-6 py-3 text-xs uppercase tracking-[0.25em]">Volver al inicio</Link></div></main>;
}
