import type { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?next=/admin");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 lg:flex">
      <aside className="border-b border-white/10 bg-zinc-950/95 px-5 py-6 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-6">
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">Internal</p>
          <h1 className="text-2xl font-black uppercase tracking-[0.12em] text-white">Tramassso Admin</h1>
        </div>

        <nav className="mt-10 grid gap-2 text-sm uppercase tracking-[0.3em] text-zinc-400">
          <Link href="/admin" className="rounded-2xl border border-zinc-800 bg-white/5 px-4 py-3 transition hover:border-zinc-500 hover:text-white">Overview</Link>
          <Link href="/events" className="rounded-2xl border border-zinc-800 px-4 py-3 transition hover:border-zinc-500 hover:text-white">Public Events</Link>
          <Link href="/routes" className="rounded-2xl border border-zinc-800 px-4 py-3 transition hover:border-zinc-500 hover:text-white">Public Routes</Link>
          <Link href="/" className="rounded-2xl border border-zinc-800 px-4 py-3 transition hover:border-zinc-500 hover:text-white">Public Home</Link>
        </nav>

        <div className="mt-10 rounded-3xl border border-zinc-800 bg-white/5 p-4 text-xs uppercase tracking-[0.3em] text-zinc-500">
          Signed in as {session.user.email ?? session.user.name ?? "admin"}
        </div>
      </aside>

      <main className="flex-1 px-5 py-8 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}