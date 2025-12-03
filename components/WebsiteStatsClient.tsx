"use client";

import { useEffect, useState } from 'react';

interface Stats {
    usersCount: number;
    clubsCount: number;
    storesCount: number;
}

export default function WebsiteStatsClient({ initial }: { initial: Stats }) {
    const [stats, setStats] = useState<Stats>(initial);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/stats');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                if (mounted && data.usersCount !== undefined) {
                    setStats({
                        usersCount: data.usersCount,
                        clubsCount: data.clubsCount,
                        storesCount: data.storesCount,
                    });
                    setError(null);
                }
            } catch (err: any) {
                if (mounted) setError('No se pudieron cargar las estadísticas');
            }
        };

        // initial fetch shortly after mount to ensure freshness
        fetchStats();

        const interval = setInterval(fetchStats, 600000); // refresh every 10 minutes

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    if (error) {
        return <div className="py-6 border-t border-slate-900 text-slate-500 text-sm">{error}</div>;
    }

    return (
        <div className="py-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats.usersCount.toLocaleString()}</div>
                    <div className="text-slate-400 text-sm">Usuarios registrados</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats.clubsCount.toLocaleString()}</div>
                    <div className="text-slate-400 text-sm">Clubs</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats.storesCount.toLocaleString()}</div>
                    <div className="text-slate-400 text-sm">Empresas</div>
                </div>
            </div>
            <div className="text-slate-500 text-sm md:text-right">Datos actualizados cada 10 minutos</div>
        </div>
    );
}
