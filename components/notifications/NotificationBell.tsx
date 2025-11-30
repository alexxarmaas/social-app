"use client";

import { useState, useEffect } from "react";
import { MdNotifications, MdNotificationsNone } from "react-icons/md";
import { getNotifications, markAllAsRead } from "@/app/actions/notification";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        fetchNotifications();
        // Poll for notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Refresh when changing pages (e.g. coming back from notifications page)
    useEffect(() => {
        fetchNotifications();
    }, [pathname]);

    const fetchNotifications = async () => {
        const result = await getNotifications();
        if (result.notifications) {
            const unread = result.notifications.filter((n: any) => !n.read).length;
            setUnreadCount(unread);
        }
    };

    return (
        <Link href="/webapp/notifications" className="relative p-2 text-slate-400 hover:text-white transition-colors">
            {unreadCount > 0 ? (
                <>
                    <MdNotifications size={24} className="text-white" />
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-slate-900">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                </>
            ) : (
                <MdNotificationsNone size={24} />
            )}
        </Link>
    );
}
