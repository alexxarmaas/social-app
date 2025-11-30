"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function saveFile(file: File): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;

    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return `/uploads/${filename}`;
}

export async function getStores(search?: string) {
    try {
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } }
            ];
        }

        const stores = await prisma.store.findMany({
            where,
            include: {
                owner: {
                    select: {
                        username: true,
                        avatar: true
                    }
                },
                _count: {
                    select: {
                        listings: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return { stores };
    } catch (error) {
        console.error("Error fetching stores:", error);
        return { error: "Error al cargar tiendas" };
    }
}

export async function getStoreById(id: string) {
    try {
        const store = await prisma.store.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        cars: true // Include cars for the garage display
                    }
                },
                listings: {
                    where: { status: "active" },
                    include: {
                        seller: {
                            select: {
                                username: true,
                                avatar: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!store) {
            return { error: "Tienda no encontrada" };
        }

        return { store };
    } catch (error) {
        console.error("Error fetching store:", error);
        return { error: "Error al cargar la tienda" };
    }
}

export async function createStore(formData: FormData) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return { error: "No autorizado" };
    }

    try {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const location = formData.get("location") as string;
        const logoFile = formData.get("logo") as File | null;
        const bannerFile = formData.get("banner") as File | null;

        const existing = await prisma.store.findUnique({
            where: { name }
        });

        if (existing) {
            return { error: "Ya existe una tienda con este nombre" };
        }

        let logoUrl = "";
        if (logoFile && logoFile.size > 0) {
            logoUrl = await saveFile(logoFile);
        }

        let bannerUrl = "";
        if (bannerFile && bannerFile.size > 0) {
            bannerUrl = await saveFile(bannerFile);
        }

        const store = await prisma.store.create({
            data: {
                name,
                description,
                location,
                latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
                longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
                logo: logoUrl,
                banner: bannerUrl,
                ownerId: session.user.id
            }
        });

        revalidatePath("/marketplace");
        return { store };
    } catch (error) {
        console.error("Error creating store:", error);
        return { error: "Error al crear la tienda" };
    }
}

export async function updateStore(storeId: string, formData: FormData) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return { error: "No autorizado" };
    }

    try {
        // Verify ownership
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { ownerId: true }
        });

        if (!store || store.ownerId !== session.user.id) {
            return { error: "No tienes permiso para editar esta tienda" };
        }

        const data: any = {};
        const name = formData.get("name");
        if (name) data.name = name as string;

        const description = formData.get("description");
        if (description) data.description = description as string;

        const location = formData.get("location");
        if (location) data.location = location as string;

        const openingHours = formData.get("openingHours");
        if (openingHours) data.openingHours = openingHours as string;

        const latitude = formData.get("latitude");
        if (latitude) data.latitude = parseFloat(latitude as string);

        const longitude = formData.get("longitude");
        if (longitude) data.longitude = parseFloat(longitude as string);

        const logoFile = formData.get("logo") as File | null;
        if (logoFile && logoFile.size > 0) {
            data.logo = await saveFile(logoFile);
        }

        const bannerFile = formData.get("banner") as File | null;
        if (bannerFile && bannerFile.size > 0) {
            data.banner = await saveFile(bannerFile);
        }

        const updatedStore = await prisma.store.update({
            where: { id: storeId },
            data
        });

        revalidatePath(`/stores/${storeId}`);
        revalidatePath("/marketplace");
        return { store: updatedStore };
    } catch (error: any) {
        console.error("Error updating store:", error);
        return { error: error.message || "Error al actualizar la tienda" };
    }
}

export async function addStoreListing(storeId: string, formData: FormData) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return { error: "No autorizado" };
    }

    try {
        // Verify ownership
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { ownerId: true }
        });

        if (!store || store.ownerId !== session.user.id) {
            return { error: "No tienes permiso para añadir productos a esta tienda" };
        }

        const title = formData.get("title") as string;
        const price = parseFloat(formData.get("price") as string);
        const category = formData.get("category") as string;
        const condition = formData.get("condition") as string;
        const description = formData.get("description") as string;
        const imageFile = formData.get("image") as File | null;
        const imageUrlInput = formData.get("imageUrl") as string;

        let imageUrls = undefined;
        if (imageFile && imageFile.size > 0) {
            const url = await saveFile(imageFile);
            imageUrls = JSON.stringify([url]);
        } else if (imageUrlInput) {
            imageUrls = JSON.stringify([imageUrlInput]);
        }

        const listing = await prisma.marketplaceListing.create({
            data: {
                title,
                price,
                category,
                condition,
                description,
                imageUrls,
                sellerId: session.user.id,
                storeId: storeId
            }
        });

        revalidatePath(`/stores/${storeId}`);
        return { listing };
    } catch (error: any) {
        console.error("Error adding store listing:", error);
        return { error: error.message || "Error al añadir el producto" };
    }
}

export async function updateStoreListing(listingId: string, formData: FormData) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return { error: "No autorizado" };
    }

    try {
        // Verify ownership
        const listing = await prisma.marketplaceListing.findUnique({
            where: { id: listingId },
            select: { sellerId: true, storeId: true }
        });

        if (!listing || listing.sellerId !== session.user.id) {
            return { error: "No tienes permiso para editar este producto" };
        }

        const data: any = {};
        const title = formData.get("title");
        if (title) data.title = title as string;

        const price = formData.get("price");
        if (price) data.price = parseFloat(price as string);

        const category = formData.get("category");
        if (category) data.category = category as string;

        const condition = formData.get("condition");
        if (condition) data.condition = condition as string;

        const description = formData.get("description");
        if (description) data.description = description as string;

        const imageFile = formData.get("image") as File | null;
        if (imageFile && imageFile.size > 0) {
            const url = await saveFile(imageFile);
            data.imageUrls = JSON.stringify([url]);
        }

        const updatedListing = await prisma.marketplaceListing.update({
            where: { id: listingId },
            data
        });

        if (listing.storeId) {
            revalidatePath(`/stores/${listing.storeId}`);
        }
        revalidatePath("/marketplace");

        return { listing: updatedListing };
    } catch (error: any) {
        console.error("Error updating listing:", error);
        return { error: error.message || "Error al actualizar el producto" };
    }
}

export async function deleteStoreListing(listingId: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return { error: "No autorizado" };
    }

    try {
        // Verify ownership
        const listing = await prisma.marketplaceListing.findUnique({
            where: { id: listingId },
            select: { sellerId: true, storeId: true }
        });

        if (!listing || listing.sellerId !== session.user.id) {
            return { error: "No tienes permiso para eliminar este producto" };
        }

        await prisma.marketplaceListing.delete({
            where: { id: listingId }
        });

        if (listing.storeId) {
            revalidatePath(`/stores/${listing.storeId}`);
        }
        revalidatePath("/marketplace");

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting listing:", error);
        return { error: error.message || "Error al eliminar el producto" };
    }
}
