"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { MdClose, MdMenu } from "react-icons/md";

const primary = [
  { href: "/garage", label: "Garage" },
  { href: "/community", label: "Comunidad" },
  { href: "/members", label: "Miembros" },
  { href: "/clubs", label: "Clubes" },
  { href: "/events", label: "Eventos" },
  { href: "/routes", label: "Rutas" },
  { href: "/partners", label: "Colaboradores" },
];

export default function WebsiteNav() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { status } = useSession();
  const accountHref = status === "authenticated" ? "/garage/mine" : "/register";
  const accountText = status === "authenticated" ? "Mi garaje" : "Unirme gratis";

  function navLink(href: string, label: string) {
    const active = path === href || path.startsWith(href + "/");
    return <Link key={href} href={href} onClick={() => setOpen(false)}
      aria-current={active ? "page" : undefined}
      className={"rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition hover:text-orange-500 " + (active ? "text-orange-500" : "text-zinc-300")}>{label}</Link>;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08090a]/95 text-white backdrop-blur-xl">
      <nav aria-label="Principal" className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-5 lg:px-8">
        <Link href="/" aria-label="Tramassso — inicio" className="font-aeroblade text-xl font-black uppercase tracking-[0.14em] text-white sm:text-2xl">Tramassso<span className="text-orange-500">.</span></Link>
        <div className="hidden items-center gap-2 lg:flex">
          {primary.map((item) => navLink(item.href, item.label))}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          {status === "unauthenticated" ? <Link href="/login" className="px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:text-white">Entrar</Link> : null}
          <Link href={accountHref} className="rounded-xl border border-orange-500 bg-orange-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black transition hover:bg-orange-400">{accountText} ↗</Link>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)}
          className="rounded-xl border border-white/15 p-2.5 text-white lg:hidden" aria-controls="tramassso-mobile-nav" aria-expanded={open}
          aria-label={open ? "Cerrar menu" : "Abrir menu"}>{open ? <MdClose size={23} /> : <MdMenu size={23} />}</button>
      </nav>
      {open ? (
        <div id="tramassso-mobile-nav" className="border-t border-white/10 bg-[#08090a] px-4 py-5 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {primary.map((item) => navLink(item.href, item.label))}
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              <Link href="/login" onClick={() => setOpen(false)} className="rounded-xl border border-white/20 p-3 text-center text-xs font-bold uppercase">Entrar</Link>
              <Link href={accountHref} onClick={() => setOpen(false)} className="rounded-xl bg-orange-500 p-3 text-center text-xs font-black uppercase text-black">{accountText}</Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
