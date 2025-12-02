"use server";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";

export async function getClub(clubId: string) {
    try {
        const session = await getServerSession(authOptions);
        const club = await prisma.club.findUnique({
            where: { id: clubId },
            include: {
                _count: {
                    select: {
                        members: true,
                        events: true
                    }
                },
                members: {
                    where: { userId: session?.user?.id },
                    select: { role: true, status: true }
                }
            }
        });

        const userMembership = club?.members[0] || null;

        return { club, userMembership };
    } catch (error) {
        return { error: "Error al obtener el club" };
    }
}

export async function getClubMembers(clubId: string, includePending: boolean = false) {
    try {
        const session = await getServerSession(authOptions);
        const currentUserId = session?.user?.id;

        let statusFilter: any = "approved";

        if (includePending && currentUserId) {
            // Verify if user is admin
            const membership = await prisma.clubMember.findUnique({
                where: {
                    userId_clubId: {
                        userId: currentUserId,
                        clubId
                    }
                }
            });

            console.log("getClubMembers Debug:", {
                clubId,
                currentUserId,
                includePending,
                userRole: membership?.role,
                userStatus: membership?.status
            });

            if (membership?.role === "admin") {
                statusFilter = { in: ["approved", "pending"] };
            }
        }

        console.log("getClubMembers Filter:", statusFilter);

        const members = await prisma.clubMember.findMany({
            where: { clubId, status: statusFilter },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true
                    }
                }
            }
        });

        console.log("getClubMembers Found:", members.length);
        return { members };
    } catch (error) {
        return { error: "Error al obtener miembros" };
    }
}

export async function getClubs(search?: string, category?: string) {
    try {
        const session = await getServerSession(authOptions);
        const currentUserId = session?.user?.id;

        const where: any = {};

        if (search) {
            where.name = { contains: search };
        }

        if (category && category !== "Todas") {
            where.category = category;
        }

        const clubs = await prisma.club.findMany({
            where,
            include: {
                _count: {
                    select: {
                        members: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        let userJoinedClubIds: string[] = [];
        let userPendingClubIds: string[] = [];
        if (currentUserId) {
            const approved = await prisma.clubMember.findMany({
                where: {
                    userId: currentUserId,
                    status: "approved"
                },
                select: {
                    clubId: true
                }
            });
            userJoinedClubIds = approved.map(m => m.clubId);

            const pending = await prisma.clubMember.findMany({
                where: {
                    userId: currentUserId,
                    status: "pending"
                },
                select: {
                    clubId: true
                }
            });
            userPendingClubIds = pending.map(m => m.clubId);
        }

        return { clubs, userJoinedClubIds, userPendingClubIds };
    } catch (error) {
        return { error: "Error al obtener clubs" };
    }
}

export async function createClub(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "No autorizado" };

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const location = formData.get("location") as string;
    const logoUrl = formData.get("logoUrl") as string;
    const coverUrl = formData.get("coverUrl") as string;

    try {
        const club = await prisma.club.create({
            data: {
                name,
                description,
                category,
                location,
                imageUrl: logoUrl,
                coverImage: coverUrl,
                ownerId: session.user.id,
                members: {
                    create: {
                        userId: session.user.id,
                        role: "admin",
                        status: "approved"
                    }
                }
            }
        });
        return { club };
    } catch (error) {
        return { error: "Error al crear el club" };
    }
}

export async function updateClub(clubId: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "No autorizado" };

    // Verify ownership
    const club = await prisma.club.findUnique({
        where: { id: clubId },
        select: { ownerId: true }
    });

    if (!club || club.ownerId !== session.user.id) {
        return { error: "No tienes permisos" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const location = formData.get("location") as string;
    const website = formData.get("website") as string;
    const instagram = formData.get("instagram") as string;
    const twitter = formData.get("twitter") as string;
    const tiktok = formData.get("tiktok") as string;
    const logoUrl = formData.get("logoUrl") as string;
    const coverUrl = formData.get("coverUrl") as string;

    try {
        await prisma.club.update({
            where: { id: clubId },
            data: {
                name,
                description,
                category,
                location,
                website,
                instagram,
                twitter,
                tiktok,
                ...(logoUrl && { imageUrl: logoUrl }),
                ...(coverUrl && { coverImage: coverUrl })
            }
        });

        revalidatePath(`/clubs/${clubId}`);
        return { success: true };
    } catch (error) {
        return { error: "Error al actualizar el club" };
    }
}

export async function joinClub(clubId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "No autorizado" };

    try {
        await prisma.clubMember.create({
            data: {
                userId: session.user.id,
                clubId,
                role: "member",
                status: "pending"
            }
        });

        revalidatePath(`/clubs/${clubId}`);
        return { success: true };
    } catch (error) {
        return { error: "Error al unirse al club" };
    }
}

export async function leaveClub(clubId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "No autorizado" };

    try {
        await prisma.clubMember.delete({
            where: {
                userId_clubId: {
                    userId: session.user.id,
                    clubId
                }
            }
        });

        revalidatePath(`/clubs/${clubId}`);
        return { success: true };
    } catch (error) {
        return { error: "Error al salir del club" };
    }
}

export async function manageMember(clubId: string, memberId: string, action: "approve" | "reject" | "kick") {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "No autorizado" };

    // Verify admin status
    const adminMembership = await prisma.clubMember.findUnique({
        where: {
            userId_clubId: {
                userId: session.user.id,
                clubId
            }
        }
    });

    if (!adminMembership || adminMembership.role !== "admin") {
        return { error: "No tienes permisos" };
    }

    try {
        if (action === "approve") {
            await prisma.clubMember.update({
                where: { id: memberId },
                data: { status: "approved" }
            });
        } else {
            // reject or kick both delete the record
            await prisma.clubMember.delete({
                where: { id: memberId }
            });
        }

        revalidatePath(`/clubs/${clubId}`);
        return { success: true };
    } catch (error) {
        return { error: "Error al gestionar miembro" };
    }
}

// --- Club Events ---

export async function createClubEvent(clubId: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "No autorizado" };

    // Verify admin
    const membership = await prisma.clubMember.findUnique({
        where: { userId_clubId: { userId: session.user.id, clubId } }
    });
    if (!membership || membership.role !== "admin") return { error: "No tienes permisos" };

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const dateStr = formData.get("date") as string;
    const timeStr = formData.get("time") as string;
    const eventType = formData.get("eventType") as string;
    const maxAttendeesStr = formData.get("maxAttendees") as string;

    const startDate = new Date(`${dateStr}T${timeStr}`);
    const maxAttendees = maxAttendeesStr ? parseInt(maxAttendeesStr) : null;

    try {
        await prisma.event.create({
            data: {
                title,
                description,
                location,
                startDate,
                eventType,
                maxAttendees,
                clubId,
                visibility: "members_only" // Default for club internal events
            }
        });
        revalidatePath(`/clubs/${clubId}`);
        return { success: true };
    } catch (error) {
        return { error: "Error al crear evento" };
    }
}

export async function updateClubEvent(eventId: string, clubId: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "No autorizado" };

    // Verify admin
    const membership = await prisma.clubMember.findUnique({
        where: { userId_clubId: { userId: session.user.id, clubId } }
    });
    if (!membership || membership.role !== "admin") return { error: "No tienes permisos" };

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const dateStr = formData.get("date") as string;
    const timeStr = formData.get("time") as string;
    const eventType = formData.get("eventType") as string;
    const maxAttendeesStr = formData.get("maxAttendees") as string;

    const startDate = new Date(`${dateStr}T${timeStr}`);
    const maxAttendees = maxAttendeesStr ? parseInt(maxAttendeesStr) : null;

    try {
        await prisma.event.update({
            where: { id: eventId },
            data: {
                title,
                description,
                location,
                startDate,
                eventType,
                maxAttendees
            }
        });
        revalidatePath(`/clubs/${clubId}`);
        return { success: true };
    } catch (error) {
        return { error: "Error al actualizar evento" };
    }
}

export async function deleteClubEvent(eventId: string, clubId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "No autorizado" };

    // Verify admin
    const membership = await prisma.clubMember.findUnique({
        where: { userId_clubId: { userId: session.user.id, clubId } }
    });
    if (!membership || membership.role !== "admin") return { error: "No tienes permisos" };

    try {
        await prisma.event.delete({ where: { id: eventId } });
        revalidatePath(`/clubs/${clubId}`);
        return { success: true };
    } catch (error) {
        return { error: "Error al eliminar evento" };
    }
}

export async function joinClubEvent(eventId: string, clubId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "No autorizado" };

    try {
        await prisma.eventAttendee.create({
            data: {
                userId: session.user.id,
                eventId,
                status: "going"
            }
        });
        revalidatePath(`/clubs/${clubId}`);
        return { success: true };
    } catch (error) {
        return { error: "Error al unirse al evento" };
    }
}

export async function leaveClubEvent(eventId: string, clubId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "No autorizado" };

    try {
        await prisma.eventAttendee.delete({
            where: {
                userId_eventId: {
                    userId: session.user.id,
                    eventId
                }
            }
        });
        revalidatePath(`/clubs/${clubId}`);
        return { success: true };
    } catch (error) {
        return { error: "Error al salir del evento" };
    }
}

// --- Club Posts ---

export async function createClubPost(clubId: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "No autorizado" };

    // Verify member
    const membership = await prisma.clubMember.findUnique({
        where: { userId_clubId: { userId: session.user.id, clubId } }
    });
    if (!membership || membership.status !== "approved") return { error: "No eres miembro" };

    const content = formData.get("content") as string;
    if (!content) return { error: "Contenido vacío" };

    try {
        await prisma.post.create({
            data: {
                content,
                authorId: session.user.id,
                clubId
            }
        });
        revalidatePath(`/clubs/${clubId}`);
        return { success: true };
    } catch (error) {
        return { error: "Error al publicar" };
    }
}

export async function getClubPosts(clubId: string) {
    try {
        const session = await getServerSession(authOptions);
        const currentUserId = session?.user?.id;

        const posts = await prisma.post.findMany({
            where: { clubId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                },
                likes: currentUserId ? {
                    where: {
                        userId: currentUserId,
                    },
                    select: {
                        userId: true,
                    },
                } : false,
            },
            orderBy: { createdAt: "desc" }
        });

        // Transform posts to include isLiked boolean
        const formattedPosts = posts.map((post) => ({
            ...post,
            isLiked: post.likes.length > 0,
            likes: undefined, // Remove the likes array from the response
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
        }));

        return { posts: formattedPosts };
    } catch (error) {
        return { error: "Error al obtener publicaciones" };
    }
}

export async function getClubMembersCars(clubId: string) {
    try {
        const cars = await prisma.car.findMany({
            where: {
                owner: {
                    clubMemberships: {
                        some: {
                            clubId: clubId,
                            status: "approved"
                        }
                    }
                }
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true
                    }
                }
            },
            orderBy: { updatedAt: "desc" }
        });
        return { cars };
    } catch (error) {
        return { error: "Error al obtener coches del club" };
    }
}
