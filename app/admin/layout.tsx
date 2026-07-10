import type { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import { isAdminRole } from "@/app/lib/admin-auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/acceso-interno-tramassso?next=/admin");
  }

  if (!isAdminRole(session.user.role)) {
    redirect("/");
  }

  const displayUser = session.user.email ?? session.user.name ?? "admin";

  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-50 lg:flex">
      <aside className="border-b border-white/10 bg-black/35 px-4 py-5 backdrop-blur-xl sm:px-5 sm:py-6 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-6">
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">Panel interno</p>
          <div>
            <p className="font-sans text-lg font-semibold tracking-tight text-white">Tramassso</p>
            <p className="mt-1 text-xs uppercase tracking-[0.32em] text-zinc-500">Administracion</p>
          </div>
        </div>

        <nav className="mt-6 grid gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-400 sm:mt-9 sm:text-xs sm:tracking-[0.24em]">
          <Link href="/admin" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/30 hover:text-white">Resumen</Link>
          <Link href="/events" className="rounded-2xl border border-zinc-800 px-4 py-3 transition hover:border-white/20 hover:bg-white/[0.03] hover:text-white">Eventos publicos</Link>
          <Link href="/routes" className="rounded-2xl border border-zinc-800 px-4 py-3 transition hover:border-white/20 hover:bg-white/[0.03] hover:text-white">Rutas publicas</Link>
          <Link href="/" className="rounded-2xl border border-zinc-800 px-4 py-3 transition hover:border-white/20 hover:bg-white/[0.03] hover:text-white">Inicio publico</Link>
        </nav>

        <div className="mt-9 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[10px] uppercase tracking-[0.32em] text-zinc-500">Sesion iniciada</p>
          <p className="mt-2 break-all font-sans text-sm text-zinc-200">{displayUser}</p>
          <p className="mt-3 inline-flex rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-zinc-400">
            {session.user.role}
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-5 sm:py-7 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
