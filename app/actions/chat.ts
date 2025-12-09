"use server";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function getClubMessages(clubId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado", code: "UNAUTHENTICATED" };
    }

    console.log("Prisma keys:", Object.keys(prisma));
    // @ts-ignore
    console.log("ClubMessage model:", prisma.clubMessage);

    try {
        // Verify membership
        const membership = await prisma.clubMember.findUnique({
            where: {
                userId_clubId: {
                    userId: session.user.id,
                    clubId
                }
            }
        });

        if (!membership || membership.status !== 'approved') {
            return { error: "No eres miembro de este club" };
        }

        const messages = await prisma.clubMessage.findMany({
            where: { clubId },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' },
            take: 50
        });

        return { messages };
    } catch (error) {
        console.error("Error fetching messages:", error);
        return { error: "Error al cargar mensajes" };
    }
}

export async function sendClubMessage(clubId: string, content: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado", code: "UNAUTHENTICATED" };
    }

    if (!content.trim()) {
        return { error: "El mensaje no puede estar vacío" };
    }

    try {
        // Verify membership
        const membership = await prisma.clubMember.findUnique({
            where: {
                userId_clubId: {
                    userId: session.user.id,
                    clubId
                }
            }
        });

        if (!membership || membership.status !== 'approved') {
            return { error: "No eres miembro de este club" };
        }

        const message = await prisma.clubMessage.create({
            data: {
                content,
                clubId,
                senderId: session.user.id
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                }
            }
        });

        return { message };
    } catch (error) {
        console.error("Error sending message:", error);
        return { error: "Error al enviar mensaje" };
    }
}
