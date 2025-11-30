"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function getDashboardStats() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return { error: "No autorizado" };
    }

    try {
        const userId = session.user.id;

        const [
            postsCount,
            followersCount,
            followingCount,
            unreadMessagesCount,
            recentPosts
        ] = await Promise.all([
            // Posts count
            prisma.post.count({
                where: { authorId: userId }
            }),
            // Followers count
            prisma.follow.count({
                where: { followingId: userId }
            }),
            // Following count
            prisma.follow.count({
                where: { followerId: userId }
            }),
            // Unread messages count (where I am a participant, sender is not me, and read is false)
            prisma.message.count({
                where: {
                    conversation: {
                        participants: {
                            some: {
                                id: userId
                            }
                        }
                    },
                    senderId: {
                        not: userId
                    },
                    read: false
                }
            }),
            // Recent posts
            prisma.post.findMany({
                where: { authorId: userId },
                orderBy: { createdAt: 'desc' },
                take: 3,
                include: {
                    _count: {
                        select: {
                            likes: true,
                            comments: true
                        }
                    }
                }
            })
        ]);

        return {
            stats: {
                posts: postsCount,
                followers: followersCount,
                following: followingCount,
                unreadMessages: unreadMessagesCount
            },
            recentPosts,
            user: session.user
        };

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return { error: "Error al cargar estadísticas" };
    }
}
