"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MdHome, MdEvent, MdStore, MdPerson, MdSearch, MdMessage, MdGroups, MdMap, MdMenu, MdClose } from "react-icons/md";

export default function MobileNav() {
    const pathname = usePathname();
    const [showMenu, setShowMenu] = useState(false);

    const isActive = (path: string) => pathname === path;

    const mainItems = [
        { href: "/feed", icon: MdHome, label: "Feed" },
        { href: "/calendar", icon: MdEvent, label: "Eventos" },
        { href: "/marketplace", icon: MdStore, label: "Tienda" },
        { href: "/clubs", icon: MdGroups, label: "Clubs" },
    ];

    const moreItems = [
        { href: "/search", icon: MdSearch, label: "Buscar" },
        { href: "/messages", icon: MdMessage, label: "Chat" },
        { href: "/map", icon: MdMap, label: "Mapa" },
        { href: "/profile", icon: MdPerson, label: "Perfil" },
    ];

    return (
        <>
            {/* More Menu Overlay */}
            {showMenu && (
                <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-8 animate-in fade-in duration-200">
                    <button
                        onClick={() => setShowMenu(false)}
                        className="absolute top-6 right-6 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"
                    >
                        <MdClose size={24} />
                    </button>

                    <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
                        {moreItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setShowMenu(false)}
                                className="flex flex-col items-center justify-center p-6 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-red-500/50 hover:bg-slate-800 transition-all group"
                            >
                                <div className={`p-3 rounded-full mb-3 ${isActive(item.href) ? "bg-red-500 text-white" : "bg-slate-700 text-slate-300 group-hover:bg-red-500 group-hover:text-white transition-colors"}`}>
                                    <item.icon size={32} />
                                </div>
                                <span className={`font-semibold ${isActive(item.href) ? "text-red-500" : "text-slate-300 group-hover:text-white"}`}>
                                    {item.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 w-full bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 z-40 pb-safe">
                <div className="flex justify-around items-center px-2 py-3">
                    {mainItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setShowMenu(false)}
                                className={`flex flex-col items-center justify-center w-full py-1 transition-colors ${active ? "text-red-500" : "text-slate-400 hover:text-slate-200"
                                    }`}
                            >
                                <div className={`relative p-1 rounded-full transition-all ${active ? "bg-red-500/10" : ""}`}>
                                    <item.icon size={24} />
                                    {active && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    )}
                                </div>
                            </Link>
                        );
                    })}

                    {/* More Button */}
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className={`flex flex-col items-center justify-center w-full py-1 transition-colors ${showMenu ? "text-red-500" : "text-slate-400 hover:text-slate-200"}`}
                    >
                        <div className={`relative p-1 rounded-full transition-all ${showMenu ? "bg-red-500/10" : ""}`}>
                            <MdMenu size={24} />
                        </div>
                    </button>
                </div>
            </nav>
        </>
    );
}
