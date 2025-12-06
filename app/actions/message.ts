"use server";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";


interface ConversationWithDetails {
    id: string;
    updatedAt: Date;
    participants: {
        id: string;
        name: string | null;
        username: string | null;
        avatar: string | null;
    }[];
    messages: {
        senderId: string;
        [key: string]: any;
    }[];
}

export async function getConversations() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        id: session.user.id,
                    },
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        // Process conversations to identify "other user" and unread count
        const processedConversations = await Promise.all(conversations.map(async (conv: ConversationWithDetails) => {
            const otherUser = conv.participants.find((p) => p.id !== session.user.id);
            const unreadCount = await prisma.message.count({
                where: {
                    conversationId: conv.id,
                    senderId: { not: session.user.id },
                    read: false,
                },
            });

            return {
                id: conv.id,
                otherUser,
                lastMessage: conv.messages[0] ? {
                    ...conv.messages[0],
                    isMine: conv.messages[0].senderId === session.user.id
                } : null,
                unreadCount,
                updatedAt: conv.updatedAt,
            };
        }));

        return { conversations: processedConversations };
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return { error: "Error al cargar conversaciones" };
    }
}

export async function getMessages(conversationId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    try {
        // Verify participation
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: true },
        });

        if (!conversation || !conversation.participants.some((p: { id: string }) => p.id === session.user.id)) {
            return { error: "No autorizado" };
        }

        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "asc" },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });

        return { messages };
    } catch (error) {
        console.error("Error fetching messages:", error);
        return { error: "Error al cargar mensajes" };
    }
}

export async function sendMessage(conversationId: string | null, recipientId: string | null, content: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    try {
        let convId = conversationId;

        // If no conversation ID, find or create one with recipient
        if (!convId && recipientId) {
            // Check if conversation exists
            const existingConv = await prisma.conversation.findFirst({
                where: {
                    AND: [
                        { participants: { some: { id: session.user.id } } },
                        { participants: { some: { id: recipientId } } },
                    ],
                },
            });

            if (existingConv) {
                convId = existingConv.id;
            } else {
                // Create new conversation
                const newConv = await prisma.conversation.create({
                    data: {
                        participants: {
                            connect: [
                                { id: session.user.id },
                                { id: recipientId },
                            ],
                        },
                    },
                });
                convId = newConv.id;
            }
        }

        if (!convId) {
            return { error: "No se pudo determinar la conversación" };
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                content,
                conversationId: convId,
                senderId: session.user.id,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: convId },
            data: { updatedAt: new Date() },
        });



        revalidatePath("/messages");
        return { success: true, message, conversationId: convId };
    } catch (error) {
        console.error("Error sending message:", error);
        return { error: "Error al enviar mensaje" };
    }
}

export async function startConversation(recipientId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    try {
        // Check if conversation exists
        const existingConv = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: session.user.id } } },
                    { participants: { some: { id: recipientId } } },
                ],
            },
        });

        if (existingConv) {
            return { conversationId: existingConv.id };
        }

        // Create new conversation
        const newConv = await prisma.conversation.create({
            data: {
                participants: {
                    connect: [
                        { id: session.user.id },
                        { id: recipientId },
                    ],
                },
            },
        });

        return { conversationId: newConv.id };
    } catch (error: any) {
        console.error("Error starting conversation:", error);
        return { error: `Error: ${error.message || "Unknown error"}` };
    }
}

export async function markConversationAsRead(conversationId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    try {
        await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: session.user.id },
                read: false,
            },
            data: { read: true },
        });

        revalidatePath("/messages");
        return { success: true };
    } catch (error) {
        console.error("Error marking as read:", error);
        return { error: "Error al marcar como leído" };
    }
}
