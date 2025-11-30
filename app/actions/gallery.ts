"use server";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";

export async function getEventPhotos(eventId: string) {
    try {
        const photos = await prisma.eventPhoto.findMany({
            where: { eventId },
            include: {
                uploader: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { photos };
    } catch (error) {
        console.error("Error fetching photos:", error);
        return { error: "Error al cargar fotos" };
    }
}

export async function uploadEventPhoto(eventId: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autorizado" };
    }

    try {
        const photoUrl = formData.get("photoUrl") as string;
        const caption = formData.get("caption") as string;

        if (!photoUrl) {
            return { error: "No se proporcionó ninguna imagen" };
        }

        // Verify user attended or created the event
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { attendees: { where: { userId: session.user.id } } }
        });

        if (!event) return { error: "Evento no encontrado" };

        const isCreator = event.creatorId === session.user.id;
        const isAttendee = event.attendees.length > 0;

        if (!isCreator && !isAttendee) {
            return { error: "Solo los asistentes pueden subir fotos" };
        }

        await prisma.eventPhoto.create({
            data: {
                url: photoUrl,
                caption,
                eventId,
                uploaderId: session.user.id
            }
        });

        revalidatePath(`/events/${eventId}`);
        return { success: true };
    } catch (error) {
        console.error("Error uploading photo:", error);
        return { error: "Error al subir la foto" };
    }
}
