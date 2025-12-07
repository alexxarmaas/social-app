"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import webpush from "web-push";

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function saveSubscription(subscription: PushSubscriptionJSON) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: "No autorizado" };
    }

    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
        return { error: "Suscripción inválida" };
    }

    try {
        await prisma.pushSubscription.create({
            data: {
                userId: session.user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
        });
        return { success: true };
    } catch (error) {
        console.error("Error saving subscription:", error);
        // Ignore unique constraint error (user already subscribed on this device)
        return { success: true };
    }
}

export async function sendNotification(userId: string, title: string, body: string, url: string = "/") {
    try {
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId },
        });

        const payload = JSON.stringify({ title, body, url });

        const promises = subscriptions.map((sub) =>
            webpush
                .sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth,
                        },
                    },
                    payload
                )
                .catch((error) => {
                    console.error("Error sending notification:", error);
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        // Subscription is no longer valid, delete it
                        return prisma.pushSubscription.delete({
                            where: { id: sub.id },
                        });
                    }
                })
        );

        await Promise.all(promises);
        return { success: true };
    } catch (error) {
        console.error("Error sending notifications:", error);
        return { error: "Error al enviar notificaciones" };
    }
}
