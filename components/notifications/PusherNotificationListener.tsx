"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import toast from "react-hot-toast";
import Image from "next/image";

interface PusherNotificationListenerProps {
    userId: string;
}

export default function PusherNotificationListener({ userId }: PusherNotificationListenerProps) {
    useEffect(() => {
        if (!userId) return;

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "key", {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
        });

        const channel = pusher.subscribe(`user-${userId}`);

        channel.bind("new-notification", (data: any) => {
            toast.custom((t) => (
                <div
                    className={`${t.visible ? 'animate-enter' : 'animate-leave'
                        } max-w-md w-full bg-slate-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-slate-700`}
                >
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <div className="h-10 w-10 rounded-full relative overflow-hidden bg-slate-700">
                                    {data.actor?.avatar ? (
                                        <Image
                                            src={data.actor.avatar}
                                            alt={data.actor.name}
                                            fill
                                            className="object-contain"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
                                    )}
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-white">
                                    {data.actor?.name || "Usuario"}
                                </p>
                                <p className="mt-1 text-sm text-slate-400">
                                    {data.message}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-slate-700">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-white focus:outline-none"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            ), { duration: 4000 });
        });

        return () => {
            pusher.unsubscribe(`user-${userId}`);
        };
    }, [userId]);

    return null; // This component doesn't render anything visible itself
}
