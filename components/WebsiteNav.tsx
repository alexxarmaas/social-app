"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { FiBell, FiMenu, FiX } from "react-icons/fi";
import TramasssoIcon, { type TramasssoIconName } from "@/components/ui/TramasssoIcon";

const primary = [
  { href: "/garage", label: "Garage", icon: "garage" },
  { href: "/community", label: "Comunidad", icon: "community" },
  { href: "/members", label: "Miembros", icon: "members" },
  { href: "/clubs", label: "Clubes", icon: "clubs" },
  { href: "/events", label: "Eventos", icon: "events" },
  { href: "/routes", label: "Rutas", icon: "routes" },
  { href: "/partners", label: "Colaboradores", icon: "partners" },
] satisfies { href: string; label: string; icon: TramasssoIconName }[];

export default function WebsiteNav({ registrationOpen, socialOpen }: { registrationOpen: boolean; socialOpen: boolean }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { status } = useSession();
  const accountHref = status === "authenticated" ? "/mi-tramassso" : registrationOpen ? "/register" : "/empezar";
  const accountText = status === "authenticated" ? "Mi Tramassso" : registrationOpen ? "Unirme gratis" : "Descubrir";
  const active = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08090a]/95 text-white backdrop-blur-xl">
      <nav aria-label="Principal" className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-5 lg:px-8">
        <Link href="/" aria-label="Tramassso, ir al inicio" onClick={() => setOpen(false)}
          className="shrink-0 font-aeroblade text-xl leading-none tracking-[0.045em] text-white sm:text-2xl">
          Tramassso<span className="text-orange-500">.</span>
        </Link>
        <div className="hidden items-center gap-0.5 xl:flex" aria-label="Secciones">
          {primary.map((item) => (
            <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined}
              className={"rounded-lg px-2.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.045em] transition-colors " +
                (active(item.href) ? "bg-orange-500/10 text-orange-400" : "text-zinc-400 hover:bg-white/[0.045] hover:text-white")}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          {status === "authenticated" && socialOpen ? (
            <Link href="/notifications" aria-label="Mis notificaciones"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 hover:border-orange-500/35 hover:text-orange-400">
              <FiBell size={18} />
            </Link>
          ) : null}
          {status === "unauthenticated" ? (
            <Link href="/login" className="rounded-lg px-3 py-2 text-xs font-bold text-zinc-300 transition-colors hover:text-white">Entrar</Link>
          ) : null}
          <Link href={accountHref} className="trm-action whitespace-nowrap">
            {accountText} <TramasssoIcon name="arrow" size="sm" frame={false} />
          </Link>
        </div>
        <button type="button" onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.035] text-white transition-colors hover:border-orange-500/50 xl:hidden"
          aria-controls="tramassso-mobile-nav" aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}>
          {open ? <FiX aria-hidden="true" size={22} /> : <FiMenu aria-hidden="true" size={22} />}
        </button>
      </nav>
      {open ? (
        <div id="tramassso-mobile-nav" className="border-t border-white/10 bg-[#0b0c0e] px-4 pb-6 pt-4 shadow-2xl xl:hidden">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-2 sm:grid-cols-2">
            {primary.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                aria-current={active(item.href) ? "page" : undefined}
                className={"flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold " +
                  (active(item.href) ? "border-orange-500/40 bg-orange-500/10 text-orange-300" : "border-white/[0.07] text-zinc-300 hover:border-white/20 hover:bg-white/5")}>
                <TramasssoIcon name={item.icon} size="sm" frame={false} className="text-orange-400" />
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mx-auto mt-4 flex max-w-7xl flex-wrap items-center gap-3 border-t border-white/10 pt-4">
            {status === "unauthenticated" ? (
              <Link href="/login" onClick={() => setOpen(false)}
                className="trm-action-secondary flex-1">Entrar</Link>
            ) : null}
            {status === "authenticated" && socialOpen ? (
              <Link href="/notifications" onClick={() => setOpen(false)} className="trm-action-secondary flex-1">
                <TramasssoIcon name="bell" frame={false} size="sm" /> Mis avisos
              </Link>
            ) : null}
            <Link href={accountHref} onClick={() => setOpen(false)} className="trm-action flex-1">
              {accountText} <TramasssoIcon name="arrow" frame={false} size="sm" />
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
