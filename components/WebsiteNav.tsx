"use client";

import { useState } from "react";
import Link from "next/link";
import { MdMenu, MdClose } from "react-icons/md";

interface WebsiteNavProps {
    currentPage?: string;
}

export default function WebsiteNav({ currentPage }: WebsiteNavProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
                        className={`hover:text-white transition-colors ${currentPage === 'home' ? 'text-white' : ''}`}
                    >
                        Inicio
                    </Link>
                    <Link
                        href="/about"
                        className={`hover:text-white transition-colors ${currentPage === 'about' ? 'text-white' : ''}`}
                    >
                        Sobre nosotros
                    </Link>
                    <Link
                        href="/who-are-we"
                        className={`hover:text-white transition-colors ${currentPage === 'who-are-we' ? 'text-white' : ''}`}
                    >
                        Quiénes somos
                    </Link>
                    <Link
                        href="/get-app"
                        className={`hover:text-white transition-colors ${currentPage === 'get-app' ? 'text-white' : ''}`}
                    >
                        Descargar app
                    </Link>
                    <Link
                        href="/events"
                        className={`hover:text-white transition-colors ${currentPage === 'events' ? 'text-white' : ''}`}
                    >
                        Eventos
                    </Link>
                    <Link
                        href="/routes"
                        className={`hover:text-white transition-colors ${currentPage === 'routes' ? 'text-white' : ''}`}
                    >
                        Rutas
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
                    <Link href="/" onClick={() => setIsMenuOpen(false)} className={`block py-2 hover:text-white transition-colors ${currentPage === 'home' ? 'text-white' : 'text-slate-300'}`}>
                        Inicio
                    </Link>
                    <Link href="/about" onClick={() => setIsMenuOpen(false)} className={`block py-2 hover:text-white transition-colors ${currentPage === 'about' ? 'text-white' : 'text-slate-300'}`}>
                        Sobre nosotros
                    </Link>
                    <Link href="/who-are-we" onClick={() => setIsMenuOpen(false)} className={`block py-2 hover:text-white transition-colors ${currentPage === 'who-are-we' ? 'text-white' : 'text-slate-300'}`}>
                        Quiénes somos
                    </Link>
                    <Link href="/get-app" onClick={() => setIsMenuOpen(false)} className={`block py-2 hover:text-white transition-colors ${currentPage === 'get-app' ? 'text-white' : 'text-slate-300'}`}>
                        Descargar app
                    </Link>
                    <Link href="/events" onClick={() => setIsMenuOpen(false)} className={`block py-2 hover:text-white transition-colors ${currentPage === 'events' ? 'text-white' : 'text-slate-300'}`}>
                        Eventos
                    </Link>
                    <Link href="/routes" onClick={() => setIsMenuOpen(false)} className={`block py-2 hover:text-white transition-colors ${currentPage === 'routes' ? 'text-white' : 'text-slate-300'}`}>
                        Rutas
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
