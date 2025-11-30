"use server";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import { uploadFileToBlob } from "@/app/lib/blob";

export async function getUserProfile() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                cars: true,
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true,
                    },
                },
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
            },
        });

        if (!user) return { error: "Usuario no encontrado" };

        return { user };
    } catch (error) {
        console.error("Error fetching profile:", error);
        return { error: "Error al cargar el perfil" };
    }
}

export async function updateProfile(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    try {
        const name = formData.get("name") as string;
        const bio = formData.get("bio") as string;
        const location = formData.get("location") as string;
        const avatarFile = formData.get("avatar") as File | null;
        const bannerFile = formData.get("banner") as File | null;

        console.log("Updating profile for user:", session.user.id);

        const data: any = { name, bio, location };

        if (avatarFile && typeof avatarFile === "object" && avatarFile.size > 0) {
            console.log("Saving avatar file...");
            try {
                data.avatar = await uploadFileToBlob(avatarFile, "avatar");
                console.log("Avatar saved:", data.avatar);
            } catch (error) {
                console.error("Error saving avatar:", error);
                return { error: "Error al guardar el avatar" };
            }
        }

        if (bannerFile && typeof bannerFile === "object" && bannerFile.size > 0) {
            console.log("Saving banner file...");
            try {
                data.banner = await uploadFileToBlob(bannerFile, "banner");
                console.log("Banner saved:", data.banner);
            } catch (error) {
                console.error("Error saving banner:", error);
                return { error: "Error al guardar el banner" };
            }
        }

        console.log("Updating user in database...");
        await prisma.user.update({
            where: { id: session.user.id },
            data,
        });

        console.log("Profile updated successfully");
        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        if (error instanceof Error) {
            return { error: "Error al actualizar el perfil: " + error.message };
        }
        return { error: "Error al actualizar el perfil" };
    }
}

export async function addCar(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    try {
        const make = formData.get("make") as string;
        const model = formData.get("model") as string;
        const year = parseInt(formData.get("year") as string);
        const modifications = formData.get("modifications") as string;
        const imageFile = formData.get("image") as File | null;

        let imageUrl = null;
        if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
            imageUrl = await uploadFileToBlob(imageFile, "car");
        }

        await prisma.car.create({
            data: {
                make,
                model,
                year,
                modifications,
                imageUrl,
                ownerId: session.user.id,
            },
        });

        revalidatePath("/webapp/profile");
        return { success: true };
    } catch (error) {
        console.error("Error adding car:", error);
        return { error: "Error al añadir el vehículo" };
    }
}

export async function updateCar(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    try {
        const carId = formData.get("id") as string;
        const make = formData.get("make") as string;
        const model = formData.get("model") as string;
        const year = parseInt(formData.get("year") as string);
        const modifications = formData.get("modifications") as string;
        const imageFile = formData.get("image") as File | null;

        // Verify ownership
        const car = await prisma.car.findUnique({
            where: { id: carId },
        });

        if (!car || car.ownerId !== session.user.id) {
            return { error: "No autorizado" };
        }

        const data: any = { make, model, year, modifications };

        if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
            data.imageUrl = await uploadFileToBlob(imageFile, "car");
        }

        await prisma.car.update({
            where: { id: carId },
            data,
        });

        revalidatePath("/webapp/profile");
        return { success: true };
    } catch (error) {
        console.error("Error updating car:", error);
        return { error: "Error al actualizar el vehículo" };
    }
}

export async function deleteCar(carId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    try {
        // Verify ownership
        const car = await prisma.car.findUnique({
            where: { id: carId },
        });

        if (!car || car.ownerId !== session.user.id) {
            return { error: "No autorizado" };
        }

        await prisma.car.delete({
            where: { id: carId },
        });

        revalidatePath("/webapp/profile");
        return { success: true };
    } catch (error) {
        console.error("Error deleting car:", error);
        return { error: "Error al eliminar el vehículo" };
    }
}
