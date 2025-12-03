import { prisma } from '@/app/lib/prisma';

export default async function WebsiteStats() {
    try {
        const [usersCount, clubsCount, storesCount] = await Promise.all([
            prisma.user.count(),
            prisma.club.count(),
            prisma.store.count()
        ]);

        return (
            <div className="py-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">{usersCount.toLocaleString()}</div>
                        <div className="text-slate-400 text-sm">Usuarios registrados</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">{clubsCount.toLocaleString()}</div>
                        <div className="text-slate-400 text-sm">Clubs</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">{storesCount.toLocaleString()}</div>
                        <div className="text-slate-400 text-sm">Empresas</div>
                    </div>
                </div>
                <div className="text-slate-500 text-sm md:text-right">
                    Datos agregados de la base de datos en tiempo real
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error loading website stats', error);
        return (
            <div className="py-6 border-t border-slate-900 text-slate-500 text-sm">Estadísticas no disponibles</div>
        );
    }
}
