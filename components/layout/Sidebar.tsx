"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdHome, MdPeople, MdEvent, MdStore, MdPerson, MdDashboard, MdSearch, MdSettings, MdMessage, MdGroups, MdMap } from "react-icons/md";

export default function Sidebar({ session }: { session: any }) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { href: "/feed", icon: MdHome, label: "Feed" },
        { href: "/search", icon: MdSearch, label: "Buscar" },
        { href: "/messages", icon: MdMessage, label: "Mensajes" },
        { href: "/clubs", icon: MdGroups, label: "Clubs" },
        { href: "/calendar", icon: MdEvent, label: "Calendario" },
        { href: "/map", icon: MdMap, label: "Mapa" },
        { href: "/marketplace", icon: MdStore, label: "Mercado" },
        { href: "/profile", icon: MdPerson, label: "Perfil" },
        { href: "/dashboard", icon: MdDashboard, label: "Panel" },
    ];

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 fixed h-full hidden lg:flex flex-col z-20">
            <div className="p-6">
                <div className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent font-aeroblade tracking-wider">
                    <span>Tramassso</span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                                ? "bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-500 font-medium border border-red-500/20"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <item.icon size={22} className={`transition-colors ${active ? "text-red-500" : "group-hover:text-white"}`} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden relative flex items-center justify-center">
                        {session?.user?.image ? (
                            <img src={session.user.image} alt="User" className="w-full h-full object-contain" />
                        ) : (
                            <MdPerson size={24} className="text-slate-400" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-white">{session?.user?.name || "Usuario"}</p>
                        <p className="text-xs text-slate-500 truncate">@{session?.user?.email?.split('@')[0]}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
