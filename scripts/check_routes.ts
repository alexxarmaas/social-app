
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const eventsCount = await prisma.event.count();
        const routesCount = await prisma.route.count();
        const stopsCount = await prisma.stop.count();

        console.log(`Events: ${eventsCount}`);
        console.log(`Routes: ${routesCount}`);
        console.log(`Stops: ${stopsCount}`);

        const routes = await prisma.route.findMany({
            include: { stops: true }
        });

        console.log('Routes detailing:');
        routes.forEach(r => {
            console.log(`- Route ID: ${r.id}, Event ID: ${r.eventId}, Stops: ${r.stops.length}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
