"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdClose, MdMenu } from "react-icons/md";

interface WebsiteNavProps {
  currentPage?: string;
}

const navItems = [
  { href: "/", label: "Inicio", page: "home" },
  { href: "/events", label: "Eventos", page: "events" },
  { href: "/routes", label: "Rutas", page: "routes" },
  { href: "/partners", label: "Colaboradores", page: "partners" },
  { href: "/#contact", label: "Contacto", page: "contact" },
];

export default function WebsiteNav({ currentPage }: WebsiteNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const activePage = currentPage ?? (pathname === "/" ? "home" : pathname.split("/").filter(Boolean)[0] ?? "home");

  const linkClass = (page: string) =>
    `relative whitespace-nowrap transition after:absolute after:-bottom-2 after:left-0 after:h-px after:bg-[#ff2b1f] after:transition-all hover:text-white ${activePage === page ? "text-white after:w-full" : "text-zinc-400 after:w-0 hover:after:w-full"}`;
  const mobileLinkClass = (page: string) =>
    `block rounded-2xl border px-3 py-3 transition hover:bg-white/5 hover:text-white ${activePage === page ? "border-red-500/40 bg-red-500/10 text-white" : "border-white/5 text-zinc-400"}`;

  return (
    <nav className="sticky top-0 z-50 border-b border-red-500/25 bg-black/90 text-zinc-50 shadow-[0_18px_60px_rgba(255,43,31,0.08)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-5 sm:py-4 lg:px-8">
        <Link href="/" className="min-w-0 font-aeroblade text-xl font-bold tracking-[0.14em] text-white drop-shadow-[0_0_18px_rgba(255,43,31,0.22)] sm:text-2xl sm:tracking-[0.18em]">
          Tramassso
        </Link>

        <div className="hidden items-center gap-5 text-[11px] uppercase tracking-[0.22em] lg:flex xl:gap-10 xl:text-xs xl:tracking-[0.32em]">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.page)}>
              {item.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="rounded-full border border-red-500/25 bg-black p-2 text-zinc-300 transition hover:border-red-500/60 hover:text-white lg:hidden"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMenuOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="absolute left-0 top-full flex w-full flex-col gap-2 border-b border-red-500/20 bg-black p-4 shadow-2xl lg:hidden">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className={mobileLinkClass(item.page)}>
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </nav>
  );
}
