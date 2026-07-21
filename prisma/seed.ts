
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    if (process.env.ALLOW_DESTRUCTIVE_SEED !== 'true') {
        throw new Error('Seed cancelado: define ALLOW_DESTRUCTIVE_SEED=true para confirmar que se borraran datos.');
    }
    const seedPassword = process.env.SEED_USER_PASSWORD;
    if (!seedPassword || seedPassword.length < 12) {
        throw new Error('Define SEED_USER_PASSWORD con al menos 12 caracteres.');
    }
    console.log('Start seeding ...');

    // Clean up existing data
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.eventAttendee.deleteMany();
    await prisma.event.deleteMany();
    await prisma.clubMember.deleteMany();
    await prisma.club.deleteMany();
    await prisma.user.deleteMany();

    // Create Users
    const password = await hash(seedPassword, 12);

    const user1 = await prisma.user.create({
        data: {
            email: 'alex@example.com',
            username: 'alex_racer',
            password,
            name: 'Alex Racer',
            bio: 'Car enthusiast and track day lover.',
            role: 'user',
            location: 'Madrid, Spain',
        },
    });

    const user2 = await prisma.user.create({
        data: {
            email: 'maria@example.com',
            username: 'maria_drift',
            password,
            name: 'Maria Drift',
            bio: 'Drift queen.',
            role: 'user',
            location: 'Barcelona, Spain',
        },
    });

    const admin = await prisma.user.create({
        data: {
            email: 'admin@tramassso.com',
            username: 'admin',
            password,
            name: 'Admin User',
            bio: 'System Administrator',
            role: 'admin',
            location: 'Global',
        },
    });

    console.log('Created users:', { user1, user2, admin });

    // Create Clubs
    const club1 = await prisma.club.create({
        data: {
            name: 'Madrid Car Club',
            description: 'The best car club in Madrid.',
            location: 'Madrid',
            category: 'JDM',
            ownerId: user1.id,
            members: {
                create: [
                    { userId: user1.id, role: 'owner' },
                    { userId: user2.id, role: 'member' },
                ],
            },
        },
    });

    const club2 = await prisma.club.create({
        data: {
            name: 'Drift Kings',
            description: 'Sliding sideways.',
            location: 'Barcelona',
            category: 'Drift',
            ownerId: user2.id,
            members: {
                create: [
                    { userId: user2.id, role: 'owner' },
                ],
            },
        },
    });

    console.log('Created clubs:', { club1, club2 });

    // Create Events
    const event1 = await prisma.event.create({
        data: {
            title: 'Madrid Night Run',
            description: 'Cruising through the streets of Madrid.',
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            location: 'Santiago Bernabeu',
            eventType: 'cruise',
            visibility: 'public',
            creatorId: user1.id,
            clubId: club1.id,
            latitude: 40.453054,
            longitude: -3.688344,
            attendees: {
                create: [
                    { userId: user1.id, status: 'going', ticketCode: 'TICKET-001' },
                    { userId: user2.id, status: 'going', ticketCode: 'TICKET-002' }
                ]
            }
        },
    });

    const event2 = await prisma.event.create({
        data: {
            title: 'Drift Day',
            description: 'Practice your drift skills.',
            startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
            location: 'Circuit de Barcelona-Catalunya',
            eventType: 'race',
            visibility: 'public',
            creatorId: user2.id,
            clubId: club2.id,
            latitude: 41.5700,
            longitude: 2.2611,
        },
    });

    console.log('Created events:', { event1, event2 });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
