import { getDashboardStats } from "@/app/actions/dashboard";
import Link from "next/link";
import { MdArticle, MdPeople, MdMessage, MdPerson, MdAdd, MdEdit, MdTrendingUp } from "react-icons/md";
import Image from "next/image";

export default async function DashboardPage() {
    const { stats, recentPosts, user, error } = await getDashboardStats();

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 pb-20">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <header>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">{user?.name || "Usuario"}</span> 👋
                    </h1>
                    <p className="text-slate-400">
                        Aquí tienes un resumen de tu actividad en Tramassso.
                    </p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 hover:border-red-500/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-slate-400 text-sm font-semibold">Posts</h3>
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                <MdArticle size={20} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats?.posts || 0}</p>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 hover:border-red-500/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-slate-400 text-sm font-semibold">Seguidores</h3>
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                                <MdPeople size={20} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats?.followers || 0}</p>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 hover:border-red-500/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-slate-400 text-sm font-semibold">Siguiendo</h3>
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                <MdPerson size={20} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats?.following || 0}</p>
                    </div>

                    <Link href="/messages" className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 hover:border-red-500/50 transition-colors group">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-slate-400 text-sm font-semibold group-hover:text-white transition-colors">Mensajes</h3>
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                <MdMessage size={20} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white flex items-center gap-2">
                            {stats?.unreadMessages || 0}
                            {(stats?.unreadMessages || 0) > 0 && (
                                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">Nuevos</span>
                            )}
                        </p>
                    </Link>
                </div>

                {/* Main Content Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Recent Posts (2/3 width) */}
                    <div className="md:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <MdTrendingUp className="text-red-500" /> Actividad Reciente
                        </h2>

                        {recentPosts && recentPosts.length > 0 ? (
                            <div className="space-y-4">
                                {recentPosts.map((post: any) => (
                                    <div key={post.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 flex gap-4">
                                        <div className="w-24 h-24 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                                            {post.imageUrls ? (
                                                <Image
                                                    src={JSON.parse(post.imageUrls)[0]}
                                                    alt="Post"
                                                    fill
                                                    className="object-contain"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">📝</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium line-clamp-2 mb-2">{post.content}</p>
                                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                                <span>❤️ {post._count.likes}</span>
                                                <span>💬 {post._count.comments}</span>
                                                <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8 text-center">
                                <p className="text-slate-400 mb-4">No has publicado nada aún.</p>
                                <Link href="/feed" className="text-red-400 hover:text-red-300 font-semibold">
                                    Crear mi primer post →
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions (1/3 width) */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white">Acciones Rápidas</h2>
                        <div className="grid gap-3">
                            <Link
                                href="/feed"
                                className="p-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-red-500/20 transition-all flex items-center gap-3"
                            >
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <MdAdd size={24} />
                                </div>
                                <div>
                                    <div className="text-sm opacity-90">Crear Nuevo</div>
                                    <div>Publicación</div>
                                </div>
                            </Link>

                            <Link
                                href="/profile"
                                className="p-4 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-3"
                            >
                                <div className="p-2 bg-slate-700 rounded-lg">
                                    <MdEdit size={24} />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-400">Editar</div>
                                    <div>Mi Perfil</div>
                                </div>
                            </Link>

                            <Link
                                href="/marketplace"
                                className="p-4 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-3"
                            >
                                <div className="p-2 bg-slate-700 rounded-lg">
                                    <span className="text-xl">💰</span>
                                </div>
                                <div>
                                    <div className="text-sm text-slate-400">Vender</div>
                                    <div>Artículo</div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
