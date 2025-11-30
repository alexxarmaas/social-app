"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getNotifications, markAsRead, markAllAsRead } from "@/app/actions/notification";
import { MdFavorite, MdComment, MdPersonAdd, MdInfo, MdCheck } from "react-icons/md";

export default function NotificationList() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        const result = await getNotifications();
        if (result.notifications) {
            setNotifications(result.notifications);
        }
        setLoading(false);
    };

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "LIKE": return <MdFavorite className="text-red-500" />;
            case "COMMENT": return <MdComment className="text-blue-500" />;
            case "FOLLOW": return <MdPersonAdd className="text-green-500" />;
            default: return <MdInfo className="text-slate-400" />;
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-slate-400">Cargando notificaciones...</div>;
    }

    if (notifications.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400">
                <div className="text-4xl mb-2">🔕</div>
                <p>No tienes notificaciones</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={handleMarkAllRead}
                    className="text-sm text-slate-400 hover:text-white flex items-center gap-1"
                >
                    <MdCheck /> Marcar todas como leídas
                </button>
            </div>

            <div className="space-y-2">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`p-4 rounded-xl border transition-colors flex gap-4 items-start ${notification.read
                            ? "bg-slate-800/30 border-slate-800"
                            : "bg-slate-800 border-slate-700"
                            }`}
                        onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    >
                        <div className="mt-1 text-xl">
                            {getIcon(notification.type)}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-700 overflow-hidden relative">
                                        {notification.actor.avatar ? (
                                            <Image src={notification.actor.avatar} alt={notification.actor.name} fill className="object-contain" unoptimized />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                                        )}
                                    </div>
                                    <span className="font-bold text-white text-sm">{notification.actor.username}</span>
                                </div>
                                <span className="text-xs text-slate-500">
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <p className="text-slate-300 text-sm mt-1">
                                {notification.message}
                            </p>

                            {notification.post && (
                                <div className="mt-2 p-2 bg-slate-900/50 rounded text-xs text-slate-400 border-l-2 border-slate-700">
                                    {notification.post.content.substring(0, 50)}...
                                </div>
                            )}
                        </div>

                        {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
