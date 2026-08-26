import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentRecceMindSession } from "@/app/lib/reccemind-auth";
import { isAdminRole } from "@/app/lib/admin-auth";
import RecceMindSignOutButton from "@/components/reccemind/RecceMindSignOutButton";
import styles from "./RecceMindLayout.module.css";

export default async function RecceMindLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentRecceMindSession();

  if (!session) {
    redirect("/acceso-reccemind");
  }

  const canManageUsers = isAdminRole(session.user.role);
  const displayUser = session.user.name ?? session.user.email ?? "tester";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[110rem] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <Link href="/reccemind" className="truncate text-sm font-semibold tracking-tight text-white">RecceMind</Link>
            <p className="text-[9px] uppercase tracking-[0.32em] text-zinc-600">Tramassso Labs · {displayUser}</p>
          </div>
          <nav className="flex shrink-0 flex-wrap items-center justify-end gap-2 text-[10px] uppercase tracking-[0.2em]">
            <Link href="/reccemind" className="rounded-full border border-zinc-800 px-3 py-2 text-zinc-400 transition hover:border-white/30 hover:text-white">Preparar</Link>
            <Link href="/reccemind/tramos" className="rounded-full border border-zinc-800 px-3 py-2 text-zinc-400 transition hover:border-white/30 hover:text-white">Mis tramos</Link>
            {canManageUsers ? (
              <Link href="/reccemind/usuarios" className="rounded-full border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2 text-rose-100 transition hover:border-rose-300/50">Testers</Link>
            ) : null}
            {canManageUsers ? (
              <Link href="/admin" className="rounded-full border border-zinc-800 px-3 py-2 text-zinc-500 transition hover:border-white/30 hover:text-white">Admin Tramassso</Link>
            ) : null}
            <RecceMindSignOutButton />
          </nav>
        </div>
      </header>
      <main className={`${styles.shell} mx-auto max-w-[110rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8`}>{children}</main>
    </div>
  );
}
