"use server";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import { uploadFileToBlob } from "@/app/lib/blob";

export async function getListings(category?: string, search?: string) {
    try {
        const where: any = {};

        if (category && category !== "Todo" && category !== "all") {
            where.category = category;
        }

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } }
            ];
        }

        const listings = await prisma.marketplaceListing.findMany({
            where,
            include: {
                seller: {
                    select: {
                        name: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return { listings };
    } catch (error) {
        console.error("Error fetching listings:", error);
        return { error: "Error al cargar los productos" };
    }
}

export async function createListing(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    try {
        const title = formData.get("title") as string;
        const price = parseFloat(formData.get("price") as string);
        const category = formData.get("category") as string;
        const condition = formData.get("condition") as string;
        const description = formData.get("description") as string;
        const imageFile = formData.get("image") as File | null;

        let imageUrls = null;
        if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
            const url = await uploadFileToBlob(imageFile, "marketplace");
            imageUrls = JSON.stringify([url]); // Schema expects String? but implies JSON array based on comment
        }

        await prisma.marketplaceListing.create({
            data: {
                title,
                price,
                category,
                condition,
                description,
                imageUrls,
                sellerId: session.user.id,
            },
        });

        revalidatePath("/marketplace");
        return { success: true };
    } catch (error) {
        console.error("Error creating listing:", error);
        return { error: "Error al crear el anuncio" };
    }
}
