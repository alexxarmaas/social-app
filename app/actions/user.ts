"use server";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification";

export async function getPublicProfile(username: string) {
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true
                    }
                },
                cars: true,
                followers: currentUserId ? {
                    where: {
                        followerId: currentUserId
                    }
                } : false,
                clubMemberships: {
                    include: {
                        club: true
                    }
                },
                eventsAttending: {
                    include: {
                        event: true
                    }
                }
            }
        });

        if (!user) {
            return { error: "Usuario no encontrado" };
        }

        const isFollowing = user.followers && user.followers.length > 0;

        // Strip sensitive data
        const { password, ...safeUser } = user;

        return { user: { ...safeUser, isFollowing } };
    } catch (error) {
        console.error("Error fetching public profile:", error);
        return { error: "Error al cargar perfil" };
    }
}

export async function followUser(targetUserId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    if (session.user.id === targetUserId) {
        return { error: "No puedes seguirte a ti mismo" };
    }

    try {
        await prisma.follow.create({
            data: {
                followerId: session.user.id,
                followingId: targetUserId
            }
        });

        // Notify user
        await createNotification(
            "FOLLOW",
            targetUserId,
            session.user.id,
            "comenzó a seguirte"
        );

        revalidatePath(`/profile`);
        return { success: true };
    } catch (error) {
        console.error("Error following user:", error);
        return { error: "Error al seguir usuario" };
    }
}

export async function unfollowUser(targetUserId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    try {
        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: session.user.id,
                    followingId: targetUserId
                }
            }
        });

        revalidatePath(`/profile`);
        return { success: true };
    } catch (error) {
        console.error("Error unfollowing user:", error);
        return { error: "Error al dejar de seguir" };
    }
}
export async function updateProfile(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const avatar = formData.get("avatar") as string;
    const banner = formData.get("banner") as string;

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                bio,
                location,
                avatar: avatar || undefined, // Only update if provided
                banner: banner || undefined
            }
        });

        revalidatePath(`/profile/${(session.user as any).username}`);
        revalidatePath(`/settings`);
        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { error: "Error al actualizar perfil" };
    }
}
