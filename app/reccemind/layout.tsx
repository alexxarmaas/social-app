import type { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import { isAdminRole } from "@/app/lib/admin-auth";

export default async function RecceMindLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/acceso-interno-tramassso?next=/reccemind");
  }

  if (!isAdminRole(session.user.role)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[110rem] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-white">Tramassso × RecceMind</p>
            <p className="text-[9px] uppercase tracking-[0.32em] text-zinc-600">Herramienta interna</p>
          </div>
          <nav className="flex shrink-0 items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
            <Link href="/admin" className="rounded-full border border-zinc-800 px-3 py-2 text-zinc-400 transition hover:border-white/30 hover:text-white">Admin</Link>
            <Link href="/" className="rounded-full border border-zinc-800 px-3 py-2 text-zinc-400 transition hover:border-white/30 hover:text-white">Web</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[110rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
