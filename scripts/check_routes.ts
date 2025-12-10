
import { getEvent } from "../app/actions/event";

async function main() {
    // We found a route with stops earlier (Route ID: afcc4d1f-...).
    // We need an event ID.
    // Let's first find an event with a route.
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const route = await prisma.route.findFirst();
    if (!route) {
        console.log("No routes found.");
        return;
    }

    console.log("Testing getEvent with Event ID:", route.eventId);
    const { event, error } = await getEvent(route.eventId);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Event Title:", event?.title);
        console.log("Route Title:", event?.route?.title);
        console.log("Stops Count:", event?.route?.stops.length);
        console.log("Stops:", event?.route?.stops.map((s: any) => ({ name: s.name, order: s.order })));
    }
}

main();
