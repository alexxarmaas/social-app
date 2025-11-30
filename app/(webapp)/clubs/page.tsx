"use client";

import { useState, useEffect } from "react";
import { getClubs, joinClub } from "@/app/actions/club";
import CreateClubModal from "@/components/clubs/CreateClubModal";
import { MdGroups, MdAdd } from "react-icons/md";
import Link from "next/link";

export default function ClubsPage() {
    const [clubs, setClubs] = useState<any[]>([]);
    const [joinedClubIds, setJoinedClubIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("Todas");

    const categories = ["Todas", "JDM", "European", "American Muscle", "Classic", "Tuner", "Off-Road"];

    useEffect(() => {
        const timer = setTimeout(() => {
            loadClubs();
        }, 300); // Debounce search

        return () => clearTimeout(timer);
    }, [search, category]);

    const loadClubs = async () => {
        setLoading(true);
        const result = await getClubs(search, category);
        if (result.clubs) {
            setClubs(result.clubs);
            if (result.userJoinedClubIds) {
                setJoinedClubIds(new Set(result.userJoinedClubIds));
            }
        }
        setLoading(false);
    };

    const handleJoinClub = async (clubId: string) => {
        const result = await joinClub(clubId);
        if (result.error) {
            alert(result.error);
        } else {
            loadClubs(); // Reload to update member counts
        }
    };

    return (
        <div className="min-h-screen max-w-[100vw] overflow-x-hidden">
            {/* Header */}
            <header className="sticky top-0 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Clubs</h1>
                        <p className="text-slate-400 text-sm mt-1">Únete a comunidades de coches</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center gap-2"
                    >
                        <MdAdd size={20} />
                        Crear Club
                    </button>
                </div>
            </header>

            {/* Search & Filters */}
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar clubs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-red-500 transition-colors"
                    />
                    <MdGroups className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                </div>

                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${category === cat
                                ? "bg-red-500 text-white"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Clubs Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-6">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                    </div>
                ) : clubs.length === 0 ? (
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8 text-center">
                        <div className="text-6xl mb-4 flex justify-center"><MdGroups size={64} className="text-slate-600" /></div>
                        <p className="text-slate-400">No se encontraron clubs</p>
                        <p className="text-slate-500 text-sm mt-2">
                            Prueba con otra búsqueda o categoría
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {clubs.map((club: any) => {
                            const isMember = joinedClubIds.has(club.id);
                            return (
                                <Link
                                    key={club.id}
                                    href={`/clubs/${club.id}`}
                                    className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden hover:border-red-500 transition-colors"
                                >
                                    <div className="p-4">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            {/* Club Icon */}
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center text-2xl sm:text-3xl overflow-hidden relative flex-shrink-0">
                                                {club.imageUrl ? (
                                                    <img src={club.imageUrl} alt={club.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <MdGroups className="text-white" />
                                                )}
                                            </div>

                                            {/* Club Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-bold text-lg truncate">{club.name}</h3>
                                                <p className="text-slate-400 text-sm truncate">{club.category}</p>
                                                <p className="text-slate-500 text-xs mt-1">
                                                    {club._count?.members || 0} miembros
                                                </p>
                                            </div>

                                            {/* Action Button */}
                                            {isMember ? (
                                                <button
                                                    className="px-4 py-2 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all"
                                                >
                                                    Ver Club
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleJoinClub(club.id);
                                                    }}
                                                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all"
                                                >
                                                    Unirse
                                                </button>
                                            )}
                                        </div>
                                        {club.description && (
                                            <p className="text-slate-300 text-sm mt-3 line-clamp-2">{club.description}</p>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            <CreateClubModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
        </div>
    );
}
