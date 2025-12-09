"use server";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado", code: "UNAUTHENTICATED" };
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                actor: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                    },
                },
                post: {
                    select: {
                        id: true,
                        content: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return { notifications };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { error: "Error al cargar notificaciones" };
    }
}

export async function markAsRead(notificationId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado", code: "UNAUTHENTICATED" };
    }

    try {
        await prisma.notification.update({
            where: {
                id: notificationId,
                userId: session.user.id,
            },
            data: {
                read: true,
            },
        });

        revalidatePath("/notifications");
        return { success: true };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return { error: "Error al marcar como leída" };
    }
}

export async function markAllAsRead() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado", code: "UNAUTHENTICATED" };
    }

    try {
        await prisma.notification.updateMany({
            where: {
                userId: session.user.id,
                read: false,
            },
            data: {
                read: true,
            },
        });

        revalidatePath("/notifications");
        return { success: true };
    } catch (error) {
        console.error("Error marking all as read:", error);
        return { error: "Error al marcar todas como leídas" };
    }
}

export async function createNotification(
    type: string,
    userId: string,
    actorId: string,
    message: string,
    postId?: string
) {
    if (userId === actorId) return; // Don't notify self actions

    try {
        const notification = await prisma.notification.create({
            data: {
                type,
                userId,
                actorId,
                message,
                postId,
            },
            include: {
                actor: {
                    select: {
                        name: true,
                        avatar: true,
                    }
                }
            }
        });

    } catch (error) {
        console.error("Error creating notification:", error);
    }
}
