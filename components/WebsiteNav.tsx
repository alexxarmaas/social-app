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

    const linkClass = (page: string) => `hover:text-white transition-colors ${activePage === page ? "text-white" : ""}`;
    const mobileLinkClass = (page: string) => `block py-2 hover:text-white transition-colors ${activePage === page ? "text-white" : "text-slate-300"}`;

    return (
        <nav className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 font-aeroblade tracking-wider">
                    Tramassso
                </Link>

                {/* Navegación de escritorio */}
                <div className="hidden lg:flex gap-6 text-slate-300">
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
                        className="hover:text-white transition-colors"
                    >
                        Contacto
                    </Link>
                </div>

                    {/* Acceso al panel y menú móvil */}
                <div className="flex gap-3 items-center">
                    <div className="hidden lg:flex gap-3">
                        <Link href="/admin" className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all">
                            Panel
                        </Link>
                    </div>

                    {/* Botón del menú móvil */}
                    <button onClick={toggleMenu} className="lg:hidden text-slate-300 hover:text-white p-2">
                        {isMenuOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
                    </button>
                </div>
            </div>

            {/* Menú móvil */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-slate-900 border-b border-slate-800 p-4 flex flex-col gap-4 shadow-xl">
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
                    <Link href="/#contact" onClick={() => setIsMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white transition-colors">
                        Contacto
                    </Link>
                    <hr className="border-slate-800" />
                    <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="block py-2 text-center bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold">
                        Panel
                    </Link>
                </div>
            )}
        </nav>
    );
}
