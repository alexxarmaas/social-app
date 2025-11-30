import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || 'file:./dev.db',
});

const globalForPrisma = globalThis as unknown as {
    prisma_v3: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma_v3 ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_v3 = prisma;

// Force recompile: v2
