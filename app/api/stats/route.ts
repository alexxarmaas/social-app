import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
    try {
        const [usersCount, clubsCount, storesCount] = await Promise.all([
            prisma.user.count(),
            prisma.club.count(),
            prisma.store.count(),
        ]);

        return NextResponse.json({ usersCount, clubsCount, storesCount });
    } catch (err) {
        console.error('Failed to load stats', err);
        return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
    }
}
