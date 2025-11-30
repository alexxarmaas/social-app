"use server";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import { hash, compare } from "bcryptjs";

export async function updatePassword(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: "Todos los campos son obligatorios" };
    }

    if (newPassword !== confirmPassword) {
        return { error: "Las contraseñas no coinciden" };
    }

    if (newPassword.length < 6) {
        return { error: "La contraseña debe tener al menos 6 caracteres" };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return { error: "Usuario no encontrado" };
        }

        const isValid = await compare(currentPassword, user.password);

        if (!isValid) {
            return { error: "La contraseña actual es incorrecta" };
        }

        const hashedPassword = await hash(newPassword, 12);

        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword }
        });

        return { success: true };
    } catch (error) {
        console.error("Error updating password:", error);
        return { error: "Error al actualizar la contraseña" };
    }
}

export async function updateEmail(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    const newEmail = formData.get("email") as string;

    if (!newEmail || !newEmail.includes("@")) {
        return { error: "Email inválido" };
    }

    try {
        // Check if email is taken
        const existingUser = await prisma.user.findUnique({
            where: { email: newEmail }
        });

        if (existingUser && existingUser.id !== session.user.id) {
            return { error: "Este email ya está en uso" };
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { email: newEmail }
        });

        revalidatePath("/settings");
        return { success: true };
    } catch (error) {
        console.error("Error updating email:", error);
        return { error: "Error al actualizar el email" };
    }
}
