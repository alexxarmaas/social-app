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
  { href: "/#contact", label: "Contacto", page: "contact" },
];

export default function WebsiteNav({ currentPage }: WebsiteNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const activePage = currentPage ?? (pathname === "/" ? "home" : pathname.split("/").filter(Boolean)[0] ?? "home");

  const linkClass = (page: string) =>
    `transition hover:text-white ${activePage === page ? "text-white" : "text-zinc-400"}`;
  const mobileLinkClass = (page: string) =>
    `block rounded-2xl px-3 py-3 transition hover:bg-white/5 hover:text-white ${activePage === page ? "bg-white/5 text-white" : "text-zinc-400"}`;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/90 text-zinc-50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="font-aeroblade text-2xl font-bold tracking-[0.18em] text-white">
          Tramassso
        </Link>

        <div className="hidden items-center gap-10 text-xs uppercase tracking-[0.32em] lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.page)}>
              {item.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="rounded-full border border-white/10 p-2 text-zinc-300 transition hover:border-white/30 hover:text-white lg:hidden"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMenuOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="absolute left-0 top-full flex w-full flex-col gap-2 border-b border-white/10 bg-zinc-950 p-4 shadow-2xl lg:hidden">
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
