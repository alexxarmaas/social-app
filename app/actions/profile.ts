"use server";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Helper to save file
async function saveFile(file: File, type: string): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");

    const uploadDir = path.join(process.cwd(), "public/uploads", type);
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        // Ignore if exists
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return `/uploads/${type}/${filename}`;
}

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
        console.log("Name:", name);
        console.log("Bio:", bio);
        console.log("Location:", location);
        console.log("Avatar file:", avatarFile?.name, avatarFile?.size);
        console.log("Banner file:", bannerFile?.name, bannerFile?.size);

        const data: any = { name, bio, location };

        if (avatarFile && typeof avatarFile === "object" && avatarFile.size > 0) {
            console.log("Saving avatar file...");
            try {
                data.avatar = await saveFile(avatarFile, "avatar");
                console.log("Avatar saved:", data.avatar);
            } catch (error) {
                console.error("Error saving avatar:", error);
                return { error: "Error al guardar el avatar: " + (error instanceof Error ? error.message : "Error desconocido") };
            }
        }

        if (bannerFile && typeof bannerFile === "object" && bannerFile.size > 0) {
            console.log("Saving banner file...");
            try {
                data.banner = await saveFile(bannerFile, "banner");
                console.log("Banner saved:", data.banner);
            } catch (error) {
                console.error("Error saving banner:", error);
                return { error: "Error al guardar el banner: " + (error instanceof Error ? error.message : "Error desconocido") };
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
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
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
            imageUrl = await saveFile(imageFile, "car");
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
            data.imageUrl = await saveFile(imageFile, "car");
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
