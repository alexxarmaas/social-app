
async function main() {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    const event = await prisma.event.findFirst({
        include: {
            route: {
                include: {
                    stops: true,
                },
            },
        },
    });

    if (!event) {
        console.log("No events found.");
        return;
    }

    if (!event.route) {
        console.log("Event found, but it has no route:", event.id);
        return;
    }

    console.log("Event Title:", event.title);
    console.log("Route Title:", event.route.title);
    console.log("Stops Count:", event.route.stops.length);
    console.log("Stops:", event.route.stops.map((stop: { name: string; order: number }) => ({ name: stop.name, order: stop.order })));
}

main();
