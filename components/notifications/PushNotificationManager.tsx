"use client";

import { useEffect, useState } from "react";
import { saveSubscription } from "@/app/actions/notifications";
import { MdNotifications, MdNotificationsActive, MdNotificationsOff } from "react-icons/md";

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>("default");

    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
            registerServiceWorker();
        }
    }, []);

    async function registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register("/sw.js", {
                scope: "/",
                updateViaCache: "none",
            });

            const sub = await registration.pushManager.getSubscription();
            setSubscription(sub);
        } catch (error) {
            console.error("Service Worker registration failed:", error);
        }
    }

    async function subscribeToPush() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ),
            });

            setSubscription(sub);
            setPermission(Notification.permission);

            // Save to server
            const result = await saveSubscription(JSON.parse(JSON.stringify(sub)));
            if (result.error) {
                console.error(result.error);
            }
        } catch (error) {
            console.error("Failed to subscribe:", error);
        }
    }

    if (!isSupported) {
        return null; // Or show a message that push is not supported
    }

    if (permission === "granted" && subscription) {
        return null; // Already subscribed, don't show anything or show "Active"
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-2xl max-w-sm">
                <div className="flex items-start gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                        <MdNotifications size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-1">Activar Notificaciones</h3>
                        <p className="text-sm text-slate-400 mb-3">
                            Recibe alertas sobre eventos, mensajes y actividad en tus publicaciones.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={subscribeToPush}
                                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-1.5 px-3 rounded-lg transition-colors"
                            >
                                Activar
                            </button>
                            <button
                                onClick={() => setIsSupported(false)} // Hide for session
                                className="text-slate-400 hover:text-white text-sm font-medium py-1.5 px-3 transition-colors"
                            >
                                Ahora no
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
