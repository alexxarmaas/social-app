"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getEvents(filter?: string, clubId?: string) {
    try {
        const where: any = {};

        if (filter === 'upcoming') {
            where.startDate = { gte: new Date() };
        } else if (filter === 'past') {
            where.startDate = { lt: new Date() };
        }

        // If clubId is provided, fetch events for that club (all visibilities for now, 
        // ideally we'd check if user is member, but this is a good start).
        // If NO clubId, fetch ONLY public events.
        if (clubId) {
            where.clubId = clubId;
        } else {
            where.visibility = 'public';
        }

        const events = await prisma.event.findMany({
            where,
            include: {
                club: {
                    select: { name: true }
                },
                attendees: {
                    where: { status: 'going' },
                    include: {
                        user: {
                            select: { id: true, username: true, avatar: true }
                        }
                    },
                    // Include ticketCode for the current user (we filter in memory or separate query usually, 
                    // but here we fetch all attendees. Ideally we should only expose ticketCode to the owner or admin)
                    // For now, let's just fetch it. In a real app, be careful exposing this.
                },
                _count: {
                    select: { attendees: { where: { status: 'going' } } }
                }
            },
            orderBy: { startDate: 'asc' }
        });

        return { events };
    } catch (error) {
        console.error("Error fetching events:", error);
        return { error: "Error al cargar eventos" };
    }
}

export async function getEvent(eventId: string) {
    try {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                club: {
                    select: { name: true, imageUrl: true }
                },
                attendees: {
                    where: { status: 'going' },
                    include: {
                        user: {
                            select: { id: true, username: true, avatar: true }
                        }
                    }
                },
                creator: {
                    select: { id: true, username: true, name: true, avatar: true }
                },
                _count: {
                    select: { attendees: { where: { status: 'going' } } }
                }
            }
        });

        if (!event) {
            return { error: "Evento no encontrado" };
        }

        return { event };
    } catch (error) {
        console.error("Error fetching event:", error);
        return { error: "Error al cargar el evento" };
    }
}

export async function createEvent(formData: FormData) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return { error: "No autorizado" };
    }

    try {
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const location = formData.get("location") as string;
        const eventType = formData.get("eventType") as string;
        const startDate = new Date(formData.get("startDate") as string);
        const maxAttendeesStr = formData.get("maxAttendees") as string;
        const maxAttendees = maxAttendeesStr ? parseInt(maxAttendeesStr) : null;
        const clubId = formData.get("clubId") as string || null;
        const visibility = formData.get("visibility") as string || "public";
        const latitudeStr = formData.get("latitude") as string;
        const longitudeStr = formData.get("longitude") as string;
        const latitude = latitudeStr ? parseFloat(latitudeStr) : null;
        const longitude = longitudeStr ? parseFloat(longitudeStr) : null;
        const priceStr = formData.get("price") as string;
        const price = priceStr ? parseFloat(priceStr) : 0;

        // URL from UploadThing
        const imageUrl = formData.get("imageUrl") as string;

        const event = await prisma.event.create({
            data: {
                title,
                description,
                location,
                eventType,
                startDate,
                maxAttendees,
                imageUrl: imageUrl || null,
                club: clubId ? { connect: { id: clubId } } : undefined,
                visibility,
                latitude,
                longitude,
                price,
                creator: { connect: { id: session.user.id } }
            }
        });

        revalidatePath("/calendar");
        return { event };
    } catch (error) {
        console.error("Error creating event:", error);
        return { error: "Error al crear el evento" };
    }
}

export async function rsvpEvent(eventId: string, status: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return { error: "No autorizado" };
    }

    try {
        // Check limit if joining (status === 'going')
        if (status === 'going') {
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                include: {
                    _count: {
                        select: { attendees: { where: { status: 'going' } } }
                    }
                }
            });

            if (event && event.maxAttendees && event._count.attendees >= event.maxAttendees) {
                // Check if user is already attending to allow status change or re-join if they left? 
                // Actually upsert handles update. If they are already 'going', it's fine.
                // But if they are 'not_going' or new, we must block.

                const existingRsvp = await prisma.eventAttendee.findUnique({
                    where: {
                        userId_eventId: {
                            userId: session.user.id,
                            eventId
                        }
                    }
                });

                if (!existingRsvp || existingRsvp.status !== 'going') {
                    return { error: "El evento está completo" };
                }
            }
        }



        const existingRsvp = await prisma.eventAttendee.findUnique({
            where: {
                userId_eventId: {
                    userId: session.user.id,
                    eventId
                }
            }
        });

        // Generate ticket code if joining and doesn't have one
        let ticketCode = existingRsvp?.ticketCode;
        if (status === 'going' && !ticketCode) {
            ticketCode = crypto.randomUUID();
        }

        const rsvp = await prisma.eventAttendee.upsert({
            where: {
                userId_eventId: {
                    userId: session.user.id,
                    eventId
                }
            },
            update: {
                status,
                ticketCode: status === 'going' ? ticketCode : existingRsvp?.ticketCode
            },
            create: {
                userId: session.user.id,
                eventId,
                status,
                ticketCode
            }
        });

        revalidatePath("/calendar");
        return { rsvp };
    } catch (error) {
        console.error("Error RSVPing to event:", error);
        return { error: "Error al confirmar asistencia" };
    }
}

export async function verifyTicket(ticketCode: string, eventId: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return { error: "No autorizado" };
    }

    try {
        // Check if user is authorized (Creator or Admin)
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { club: { include: { members: true } } }
        });

        if (!event) return { error: "Evento no encontrado" };

        const isCreator = event.creatorId === session.user.id;
        const isClubAdmin = event.club?.members.some(m => m.userId === session.user.id && ['admin', 'owner'].includes(m.role));

        if (!isCreator && !isClubAdmin) {
            return { error: "No tienes permiso para verificar entradas en este evento" };
        }

        const attendee = await prisma.eventAttendee.findFirst({
            where: {
                eventId,
                ticketCode
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        });

        if (!attendee) {
            return { error: "Entrada no válida" };
        }

        return { attendee };
    } catch (error) {
        console.error("Error verifying ticket:", error);
        return { error: "Error al verificar entrada" };
    }
}

export async function checkInAttendee(ticketCode: string, eventId: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return { error: "No autorizado" };
    }

    try {
        // Re-verify permission (good practice)
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { club: { include: { members: true } } }
        });

        if (!event) return { error: "Evento no encontrado" };

        const isCreator = event.creatorId === session.user.id;
        const isClubAdmin = event.club?.members.some(m => m.userId === session.user.id && ['admin', 'owner'].includes(m.role));

        if (!isCreator && !isClubAdmin) {
            return { error: "No tienes permiso" };
        }

        const attendee = await prisma.eventAttendee.update({
            where: { ticketCode },
            data: { checkedIn: true }
        });

        revalidatePath(`/events/${eventId}/manage`);
        return { success: true, attendee };
    } catch (error) {
        console.error("Error checking in attendee:", error);
        return { error: "Error al registrar entrada" };
    }
}

export async function verifyTicketByCode(ticketCode: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return { error: "No autorizado" };
    }

    try {
        // Find the attendee and the associated event
        const attendee = await prisma.eventAttendee.findUnique({
            where: { ticketCode },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true
                    }
                },
                event: {
                    include: {
                        club: {
                            include: {
                                members: true
                            }
                        }
                    }
                }
            }
        });

        if (!attendee) {
            return { error: "Entrada no válida o no encontrada" };
        }

        const event = attendee.event;

        // Check permissions
        const isCreator = event.creatorId === session.user.id;
        const isClubAdmin = event.club?.members.some(m => m.userId === session.user.id && ['admin', 'owner'].includes(m.role));

        if (!isCreator && !isClubAdmin) {
            return { error: "No tienes permiso para verificar entradas en este evento" };
        }

        return { attendee };
    } catch (error) {
        console.error("Error verifying ticket by code:", error);
        return { error: "Error al verificar entrada" };
    }
}

export async function deleteEvent(eventId: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return { error: "No autorizado" };
    }

    try {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { club: { include: { members: true } } }
        });

        if (!event) return { error: "Evento no encontrado" };

        const isCreator = event.creatorId === session.user.id;
        const isClubAdmin = event.club?.members.some(m => m.userId === session.user.id && ['admin', 'owner'].includes(m.role));

        if (!isCreator && !isClubAdmin) {
            return { error: "No tienes permiso para eliminar este evento" };
        }

        await prisma.event.delete({
            where: { id: eventId }
        });

        revalidatePath("/calendar");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error deleting event:", error);
        return { error: "Error al eliminar el evento" };
    }
}

export async function updateEvent(eventId: string, formData: FormData) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return { error: "No autorizado" };
    }

    try {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { club: { include: { members: true } } }
        });

        if (!event) return { error: "Evento no encontrado" };

        const isCreator = event.creatorId === session.user.id;
        const isClubAdmin = event.club?.members.some(m => m.userId === session.user.id && ['admin', 'owner'].includes(m.role));

        if (!isCreator && !isClubAdmin) {
            return { error: "No tienes permiso para editar este evento" };
        }

        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const location = formData.get("location") as string;
        const address = formData.get("address") as string;
        const startDate = formData.get("startDate") as string;
        const endDate = formData.get("endDate") as string;
        const eventType = formData.get("eventType") as string;
        const visibility = formData.get("visibility") as string;
        const maxAttendees = formData.get("maxAttendees") as string;
        const price = formData.get("price") as string;
        const imageUrl = formData.get("imageUrl") as string;
        const latitude = formData.get("latitude") as string;
        const longitude = formData.get("longitude") as string;

        const updateData: any = {
            title,
            description,
            location,
            address,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            eventType,
            visibility,
            maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
            price: price ? parseFloat(price) : 0,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
        };

        if (imageUrl) {
            updateData.imageUrl = imageUrl;
        }

        await prisma.event.update({
            where: { id: eventId },
            data: updateData,
        });

        revalidatePath("/calendar");
        revalidatePath(`/events/${eventId}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating event:", error);
        return { error: "Error al actualizar el evento" };
    }
}
