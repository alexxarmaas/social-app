"use server";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function searchUsers(query: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    if (!query || query.trim().length < 2) {
        return { users: [] };
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: query } },
                    { name: { contains: query } },
                    { bio: { contains: query } },
                    { location: { contains: query } },
                ],
                NOT: {
                    id: session.user.id, // Exclude current user
                },
            },
            select: {
                id: true,
                username: true,
                name: true,
                bio: true,
                avatar: true,
                location: true,
                _count: {
                    select: {
                        posts: true,
                        cars: true,
                    },
                },
            },
            take: 20,
        });

        return { users };
    } catch (error) {
        console.error("Error searching users:", error);
        return { error: "Error al buscar usuarios" };
    }
}

export async function searchCars(query: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    if (!query || query.trim().length < 2) {
        return { cars: [] };
    }

    try {
        const cars = await prisma.car.findMany({
            where: {
                OR: [
                    { make: { contains: query } },
                    { model: { contains: query } },
                    { modifications: { contains: query } },
                    { description: { contains: query } },
                ],
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            take: 20,
        });

        return { cars };
    } catch (error) {
        console.error("Error searching cars:", error);
        return { error: "Error al buscar coches" };
    }
}

export async function searchClubs(query: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    if (!query || query.trim().length < 2) {
        return { clubs: [] };
    }

    try {
        const clubs = await prisma.club.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { description: { contains: query } },
                    { category: { contains: query } },
                ],
            },
            include: {
                _count: {
                    select: {
                        members: true,
                        posts: true,
                        events: true,
                    },
                },
            },
            take: 20,
        });

        return { clubs };
    } catch (error) {
        console.error("Error searching clubs:", error);
        return { error: "Error al buscar clubs" };
    }
}

export async function searchAll(query: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    if (!query || query.trim().length < 2) {
        return { users: [], cars: [], clubs: [] };
    }

    try {
        const [usersResult, carsResult, clubsResult] = await Promise.all([
            searchUsers(query),
            searchCars(query),
            searchClubs(query),
        ]);

        return {
            users: usersResult.users || [],
            cars: carsResult.cars || [],
            clubs: clubsResult.clubs || [],
        };
    } catch (error) {
        console.error("Error in global search:", error);
        return { error: "Error en la búsqueda" };
    }
}
