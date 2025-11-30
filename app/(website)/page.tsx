"use client";

import Image from "next/image";
import Link from "next/link";
import { MdSpeed, MdGroups, MdStore, MdEvent, MdSecurity, MdDevices } from "react-icons/md";
import WebsiteNav from "@/components/WebsiteNav";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden">
      {/* Navigation */}
      <WebsiteNav currentPage="home" />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            <span className="block text-white">La Red Social Definitiva</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              Para Amantes del Motor
            </span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-300 mb-10">
            Conecta con entusiastas, únete a clubs exclusivos, encuentra eventos y compra/vende piezas en el marketplace especializado más grande.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-full text-lg font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all transform hover:-translate-y-1"
            >
              Unirse Ahora Gratis
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 bg-slate-800 border border-slate-700 rounded-full text-lg font-bold hover:bg-slate-700 transition-all"
            >
              Saber Más
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Todo lo que necesitas</h2>
            <p className="text-slate-400 text-lg">Diseñado por y para entusiastas del automovilismo</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-red-500/50 transition-colors group">
              <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
                <MdGroups className="text-3xl text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Clubs y Comunidades</h3>
              <p className="text-slate-400">Crea o únete a clubs basados en tu coche, región o estilo. Organiza rutas y mantén el contacto.</p>
            </div>

            <div className="p-8 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-colors group">
              <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
                <MdStore className="text-3xl text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Marketplace Especializado</h3>
              <p className="text-slate-400">Compra y vende coches y piezas con confianza. Filtros específicos para encontrar exactamente lo que buscas.</p>
            </div>

            <div className="p-8 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-colors group">
              <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <MdEvent className="text-3xl text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Eventos y KDDs</h3>
              <p className="text-slate-400">Descubre eventos cerca de ti. Desde grandes exposiciones hasta reuniones locales nocturnas.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">10k+</div>
              <div className="text-slate-500 uppercase text-sm font-semibold">Usuarios</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-slate-500 uppercase text-sm font-semibold">Clubs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">2.5k</div>
              <div className="text-slate-500 uppercase text-sm font-semibold">Eventos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">15k+</div>
              <div className="text-slate-500 uppercase text-sm font-semibold">Piezas Vendidas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-500 rounded-lg flex items-center justify-center font-bold text-xl">
                  T
                </div>
                <span className="font-bold text-xl tracking-tight">Tramassso</span>
              </div>
              <p className="text-slate-400 max-w-md">
                La plataforma líder para la cultura automovilística. Conectando pasión, máquinas y personas en un solo lugar.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Plataforma</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/feed" className="hover:text-red-500 transition-colors">Feed</Link></li>
                <li><Link href="/marketplace" className="hover:text-red-500 transition-colors">Marketplace</Link></li>
                <li><Link href="/clubs" className="hover:text-red-500 transition-colors">Clubs</Link></li>
                <li><Link href="/calendar" className="hover:text-red-500 transition-colors">Eventos</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/privacy" className="hover:text-red-500 transition-colors">Privacidad</Link></li>
                <li><Link href="/terms" className="hover:text-red-500 transition-colors">Términos</Link></li>
                <li><Link href="/cookies" className="hover:text-red-500 transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-900 text-center text-slate-500 text-sm">
            © 2025 Tramassso. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
