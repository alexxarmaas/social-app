import { getUserProfile } from "@/app/actions/profile";
import Image from "next/image";
import Link from "next/link";
import GarageGrid from "@/components/profile/GarageGrid";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { MdSettings, MdVerified, MdLocationOn, MdCalendarToday, MdBarChart, MdBookmark, MdNotifications, MdEvent, MdGroups } from "react-icons/md";

export default async function ProfilePage() {
    const { user, error } = await getUserProfile();

    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <p>{error || "Por favor inicia sesión"}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="sticky top-0 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 z-40">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        {user.username} <MdVerified className="text-blue-500" />
                    </h1>
                    <Link href="/settings" className="text-slate-400 hover:text-white">
                        <MdSettings size={24} />
                    </Link>
                </div>
            </header>

            {/* Profile Content */}
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Profile Card */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden shadow-xl">
                    {/* Cover Image */}
                    <div className="h-40 bg-gradient-to-r from-slate-800 to-slate-700 relative">
                        {user.banner && (
                            <Image
                                src={user.banner}
                                alt="Banner"
                                fill
                                className="object-fill"
                                unoptimized
                            />
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="px-6 pb-6 pt-20">
                        {/* Avatar - positioned absolutely but outside the text flow */}
                        <div className="absolute -mt-36 left-6">
                            <div className="w-32 h-32 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden relative shadow-lg">
                                {user.avatar ? (
                                    <Image
                                        src={user.avatar}
                                        alt={user.name || user.username}
                                        fill
                                        className="object-fill"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-white font-bold text-2xl">{user.name || user.username}</h2>
                                    <p className="text-slate-400">@{user.username}</p>
                                </div>
                            </div>

                            <p className="text-slate-300 mt-4 leading-relaxed" style={{ whiteSpace: "pre-line" }}>
                                {user.bio || "Sin biografía aún."}
                            </p>

                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-400">
                                {user.location && (
                                    <span className="flex items-center gap-1"><MdLocationOn /> {user.location}</span>
                                )}
                                <span className="flex items-center gap-1"><MdCalendarToday /> Se unió en {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div className="flex gap-6 mt-6 border-t border-slate-700 pt-4">
                                <div className="text-center">
                                    <span className="block text-white font-bold text-lg">{user._count?.posts || 0}</span>
                                    <span className="text-slate-500 text-xs uppercase">Posts</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-white font-bold text-lg">{user._count?.followers || 0}</span>
                                    <span className="text-slate-500 text-xs uppercase">Seguidores</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-white font-bold text-lg">{user._count?.following || 0}</span>
                                    <span className="text-slate-500 text-xs uppercase">Siguiendo</span>
                                </div>
                            </div>

                            <ProfileHeader user={user} />
                        </div>
                    </div>
                </div>

                {/* Garage Section */}
                <GarageGrid cars={user.cars} isOwner={true} />

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 text-center hover:border-red-500/50 transition-colors">
                        <div className="text-3xl mb-2 flex justify-center text-yellow-500"><MdEvent size={32} /></div>
                        <div className="text-white font-bold text-2xl">{user.eventsAttending?.length || 0}</div>
                        <div className="text-slate-400 text-sm">Eventos</div>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 text-center hover:border-red-500/50 transition-colors">
                        <div className="text-3xl mb-2 flex justify-center text-blue-500"><MdGroups size={32} /></div>
                        <div className="text-white font-bold text-2xl">{user.clubMemberships?.length || 0}</div>
                        <div className="text-slate-400 text-sm">Clubs</div>
                    </div>
                </div>

                {/* Clubs Section */}
                {user.clubMemberships && user.clubMemberships.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <MdGroups className="text-blue-500" /> Mis Clubs
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {user.clubMemberships.map((membership: any) => (
                                <Link href={`/clubs/${membership.club.id}`} key={membership.club.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 flex items-center gap-4 hover:bg-slate-800 transition-colors">
                                    <div className="w-12 h-12 rounded-lg bg-slate-700 overflow-hidden relative flex-shrink-0">
                                        {membership.club.imageUrl ? (
                                            <Image src={membership.club.imageUrl} alt={membership.club.name} fill className="object-fill" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500"><MdGroups /></div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">{membership.club.name}</h4>
                                        <p className="text-slate-400 text-xs">{membership.role === 'admin' ? 'Administrador' : 'Miembro'}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Events Section */}
                {user.eventsAttending && user.eventsAttending.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <MdEvent className="text-yellow-500" /> Mis Eventos
                        </h3>
                        <div className="space-y-4">
                            {user.eventsAttending.map((attendance: any) => (
                                <Link href={`/events/${attendance.event.id}`} key={attendance.event.id} className="block bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden hover:border-yellow-500 transition-colors">
                                    <div className="flex">
                                        <div className="w-24 bg-slate-700 relative">
                                            {attendance.event.image ? (
                                                <Image src={attendance.event.image} alt={attendance.event.title} fill className="object-fill" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-500"><MdEvent size={24} /></div>
                                            )}
                                        </div>
                                        <div className="p-4 flex-1">
                                            <h4 className="text-white font-bold">{attendance.event.title}</h4>
                                            <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                                                <MdCalendarToday size={14} />
                                                {new Date(attendance.event.date).toLocaleDateString()}
                                            </p>
                                            <p className="text-slate-500 text-xs mt-2 truncate">{attendance.event.location}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="space-y-3">
                    <button className="w-full py-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 text-white font-semibold hover:border-red-500 transition-colors flex items-center justify-between px-6 group">
                        <span className="flex items-center gap-3">
                            <MdBarChart className="text-2xl text-slate-400 group-hover:text-red-500 transition-colors" />
                            Actividad
                        </span>
                        <span className="text-slate-400">→</span>
                    </button>

                    <button className="w-full py-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 text-white font-semibold hover:border-red-500 transition-colors flex items-center justify-between px-6 group">
                        <span className="flex items-center gap-3">
                            <MdBookmark className="text-2xl text-slate-400 group-hover:text-red-500 transition-colors" />
                            Guardados
                        </span>
                        <span className="text-slate-400">→</span>
                    </button>

                    <Link href="/notifications" className="w-full py-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 text-white font-semibold hover:border-red-500 transition-colors flex items-center justify-between px-6 group">
                        <span className="flex items-center gap-3">
                            <MdNotifications className="text-2xl text-slate-400 group-hover:text-red-500 transition-colors" />
                            Notificaciones
                        </span>
                        <span className="text-slate-400">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
