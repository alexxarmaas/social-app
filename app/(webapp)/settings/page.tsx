import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import AccountSettings from "@/components/settings/AccountSettings";
import Link from "next/link";
import { MdSettings, MdSecurity, MdPerson, MdNotifications } from "react-icons/md";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="sticky top-0 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 z-40">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
                    <MdSettings className="text-2xl text-red-500" />
                    <div>
                        <h1 className="text-2xl font-bold text-white">Configuración</h1>
                        <p className="text-slate-400 text-sm">Gestiona tu cuenta y perfil</p>
                    </div>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 py-6">
                <div className="flex flex-col gap-6">
                    {/* Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <Link href={`/profile/${user.username}`} className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg font-semibold whitespace-nowrap flex items-center gap-2 transition-colors">
                            <MdPerson />
                            Perfil
                        </Link>
                        <button className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold whitespace-nowrap flex items-center gap-2">
                            <MdSecurity />
                            Cuenta
                        </button>
                        <button className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg font-semibold whitespace-nowrap flex items-center gap-2 transition-colors cursor-not-allowed opacity-50">
                            <MdNotifications />
                            Notificaciones
                        </button>
                    </div>

                    {/* Content */}
                    <AccountSettings user={user} />
                </div>
            </div>
        </div>
    );
}
