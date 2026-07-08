"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdMenu, MdClose } from "react-icons/md";

interface WebsiteNavProps {
    currentPage?: string;
}

export default function WebsiteNav({ currentPage }: WebsiteNavProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const activePage = currentPage ?? (
        pathname === "/"
            ? "home"
            : pathname.split("/").filter(Boolean)[0] ?? "home"
    );

    const linkClass = (page: string) => `transition hover:text-white ${activePage === page ? "text-white" : "text-zinc-400"}`;
    const mobileLinkClass = (page: string) => `block rounded-2xl px-3 py-3 transition hover:bg-white/5 hover:text-white ${activePage === page ? "bg-white/5 text-white" : "text-zinc-400"}`;

    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/90 text-zinc-50 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
                <Link href="/" className="font-aeroblade text-2xl font-bold tracking-[0.18em] text-white">
                    Tramassso
                </Link>

                {/* Navegación de escritorio */}
                <div className="hidden items-center gap-8 text-xs uppercase tracking-[0.28em] lg:flex">
                    <Link
                        href="/"
                        className={linkClass("home")}
                    >
                        Inicio
                    </Link>
                    <Link
                        href="/about"
                        className={linkClass("about")}
                    >
                        Sobre nosotros
                    </Link>
                    <Link
                        href="/who-are-we"
                        className={linkClass("who-are-we")}
                    >
                        Quiénes somos
                    </Link>
                    <Link
                        href="/get-app"
                        className={linkClass("get-app")}
                    >
                        Descargar app
                    </Link>
                    <Link
                        href="/events"
                        className={linkClass("events")}
                    >
                        Eventos
                    </Link>
                    <Link
                        href="/routes"
                        className={linkClass("routes")}
                    >
                        Rutas
                    </Link>
                    <Link
                        href="/#contact"
                        className="text-zinc-400 transition hover:text-white"
                    >
                        Contacto
                    </Link>
                </div>

                    {/* Acceso al panel y menú móvil */}
                <div className="flex gap-3 items-center">
                    <div className="hidden lg:flex">
                        <Link href="/admin" className="rounded-full bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-zinc-200">
                            Panel
                        </Link>
                    </div>

                    {/* Botón del menú móvil */}
                    <button onClick={toggleMenu} className="rounded-full border border-white/10 p-2 text-zinc-300 transition hover:border-white/30 hover:text-white lg:hidden" aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}>
                        {isMenuOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
                    </button>
                </div>
            </div>

            {/* Menú móvil */}
            {isMenuOpen && (
                <div className="absolute left-0 top-full flex w-full flex-col gap-2 border-b border-white/10 bg-zinc-950 p-4 shadow-2xl lg:hidden">
                    <Link href="/" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass("home")}>
                        Inicio
                    </Link>
                    <Link href="/about" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass("about")}>
                        Sobre nosotros
                    </Link>
                    <Link href="/who-are-we" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass("who-are-we")}>
                        Quiénes somos
                    </Link>
                    <Link href="/get-app" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass("get-app")}>
                        Descargar app
                    </Link>
                    <Link href="/events" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass("events")}>
                        Eventos
                    </Link>
                    <Link href="/routes" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass("routes")}>
                        Rutas
                    </Link>
                    <Link href="/#contact" onClick={() => setIsMenuOpen(false)} className="block rounded-2xl px-3 py-3 text-zinc-400 transition hover:bg-white/5 hover:text-white">
                        Contacto
                    </Link>
                    <hr className="border-white/10" />
                    <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="block rounded-full bg-white px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-zinc-200">
                        Panel
                    </Link>
                </div>
            )}
        </nav>
    );
}
