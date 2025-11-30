"use client";

import Image from "next/image";
import Link from "next/link";
import { MdPerson, MdDirectionsCar, MdGroups, MdLocationOn, MdSearch } from "react-icons/md";

interface SearchResultsProps {
    users?: any[];
    cars?: any[];
    clubs?: any[];
    loading?: boolean;
}

export default function SearchResults({ users = [], cars = [], clubs = [], loading = false }: SearchResultsProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
        );
    }

    const hasResults = users.length > 0 || cars.length > 0 || clubs.length > 0;

    if (!hasResults) {
        return (
            <div className="text-center py-12">
                <div className="text-slate-500 text-6xl mb-4 flex justify-center"><MdSearch size={64} /></div>
                <p className="text-slate-400 text-lg">No se encontraron resultados</p>
                <p className="text-slate-500 text-sm mt-2">Intenta con otros términos de búsqueda</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Users */}
            {users.length > 0 && (
                <div>
                    <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                        <MdPerson className="text-red-500" /> Usuarios ({users.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {users.map((user: any) => (
                            <Link
                                key={user.id}
                                href={`/profile/${user.username}`}
                                className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 hover:border-red-500 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden relative flex-shrink-0">
                                        {user.avatar ? (
                                            <Image src={user.avatar} alt={user.name || user.username} fill className="object-contain" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl">
                                                <MdPerson />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-semibold truncate">{user.name || user.username}</h3>
                                        <p className="text-slate-400 text-sm truncate">@{user.username}</p>
                                        {user.location && (
                                            <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                                                <MdLocationOn size={14} /> {user.location}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right text-xs text-slate-500">
                                        <div>{user._count?.posts || 0} posts</div>
                                        <div>{user._count?.cars || 0} coches</div>
                                    </div>
                                </div>
                                {user.bio && (
                                    <p className="text-slate-300 text-sm mt-3 line-clamp-2">{user.bio}</p>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Cars */}
            {cars.length > 0 && (
                <div>
                    <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                        <MdDirectionsCar className="text-red-500" /> Coches ({cars.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cars.map((car: any) => (
                            <div
                                key={car.id}
                                className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden hover:border-red-500 transition-colors"
                            >
                                <div className="relative h-40 bg-slate-700">
                                    {car.imageUrl ? (
                                        <Image src={car.imageUrl} alt={`${car.make} ${car.model}`} fill className="object-contain" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl text-slate-600">
                                            <MdDirectionsCar size={48} />
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-white font-bold text-lg">
                                        {car.make} {car.model}
                                    </h3>
                                    <p className="text-slate-400 text-sm">{car.year}</p>
                                    {car.modifications && (
                                        <p className="text-slate-300 text-sm mt-2 line-clamp-2">{car.modifications}</p>
                                    )}
                                    <Link
                                        href={`/profile/${car.owner.username}`}
                                        className="flex items-center gap-2 mt-3 text-slate-400 hover:text-red-500 text-sm"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-slate-700 overflow-hidden relative">
                                            {car.owner.avatar ? (
                                                <Image src={car.owner.avatar} alt={car.owner.name} fill className="object-contain" />
                                            ) : (
                                                <MdPerson />
                                            )}
                                        </div>
                                        <span>@{car.owner.username}</span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Clubs */}
            {clubs.length > 0 && (
                <div>
                    <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                        <MdGroups className="text-red-500" /> Clubs ({clubs.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {clubs.map((club: any) => (
                            <Link
                                key={club.id}
                                href={`/clubs/${club.id}`}
                                className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 hover:border-red-500 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                        <MdGroups className="text-white text-2xl" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-bold truncate">{club.name}</h3>
                                        <p className="text-slate-400 text-sm">{club.category}</p>
                                        {club.description && (
                                            <p className="text-slate-300 text-sm mt-2 line-clamp-2">{club.description}</p>
                                        )}
                                        <div className="flex gap-4 mt-3 text-xs text-slate-500">
                                            <span>{club._count?.members || 0} miembros</span>
                                            <span>{club._count?.posts || 0} posts</span>
                                            <span>{club._count?.events || 0} eventos</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
