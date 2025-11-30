import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const email = formData.get("email") as string;
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;
        const role = formData.get("role") as string;
        const name = formData.get("name") as string;

        // Club fields
        const clubName = formData.get("clubName") as string;
        const clubCategory = formData.get("clubCategory") as string;

        // Store fields
        const storeName = formData.get("storeName") as string;
        const storeDescription = formData.get("storeDescription") as string;

        // URLs from UploadThing
        const avatarUrl = formData.get("avatarUrl") as string;
        const bannerUrl = formData.get("bannerUrl") as string;

        if (!email || !username || !password) {
            return NextResponse.json(
                { error: "Faltan campos obligatorios" },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "El usuario o correo ya existe" },
                { status: 400 }
            );
        }

        // Check if club name exists
        if (role === "club_admin" && clubName) {
            const existingClub = await prisma.club.findUnique({
                where: { name: clubName }
            });
            if (existingClub) {
                return NextResponse.json(
                    { error: "Ya existe un club con ese nombre" },
                    { status: 400 }
                );
            }
        }

        // Check if store name exists
        if (role === "store_manager" && storeName) {
            const existingStore = await prisma.store.findUnique({
                where: { name: storeName }
            });
            if (existingStore) {
                return NextResponse.json(
                    { error: "Ya existe una tienda con ese nombre" },
                    { status: 400 }
                );
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user and related entities in transaction
        const user = await prisma.$transaction(async (tx) => {
            // Create User
            const newUser = await tx.user.create({
                data: {
                    email,
                    username,
                    password: hashedPassword,
                    role: role || "user",
                    name: name || username,
                    avatar: avatarUrl || null,
                    banner: bannerUrl || null,
                },
            });

            // Handle Club Admin
            if (role === "club_admin") {
                if (!clubName || !clubCategory) {
                    throw new Error("Faltan datos del club");
                }
                await tx.club.create({
                    data: {
                        name: clubName,
                        category: clubCategory,
                        members: {
                            create: {
                                userId: newUser.id,
                                role: "admin",
                                status: "approved"
                            }
                        }
                    }
                });
            }

            // Handle Store Manager
            if (role === "store_manager") {
                if (!storeName) {
                    throw new Error("Faltan datos de la tienda");
                }
                await tx.store.create({
                    data: {
                        name: storeName,
                        description: storeDescription,
                        ownerId: newUser.id
                    }
                });
            }

            return newUser;
        });

        return NextResponse.json(
            { message: "Usuario creado exitosamente", user: { id: user.id, email: user.email } },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error al crear el usuario" },
            { status: 500 }
        );
    }
}
