import { prisma } from '@/app/lib/prisma';
import WebsiteStatsClient from './WebsiteStatsClient';

export default async function WebsiteStats() {
    try {
        const [usersCount, clubsCount, storesCount] = await Promise.all([
            prisma.user.count(),
            prisma.club.count(),
            prisma.store.count(),
        ]);

        const initial = { usersCount, clubsCount, storesCount };

        return (
            // Server-rendered wrapper that passes initial counts to client poller
            <div className="py-6 border-t border-slate-900">
                {/* WebsiteStatsClient is a client component that will poll /api/stats */}
                <WebsiteStatsClient initial={initial} />
            </div>
        );
    } catch (error) {
        console.error('Error loading website stats', error);
        return (
            <div className="py-6 border-t border-slate-900 text-slate-500 text-sm">Estadísticas no disponibles</div>
        );
    }
}
