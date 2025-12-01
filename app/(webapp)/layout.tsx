import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import NotificationBell from "@/components/notifications/NotificationBell";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import TicketModalWrapper from "@/components/events/TicketModalWrapper";
import { Analytics } from '@vercel/analytics/next';

export default async function WebAppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    return (
        <div className="min-h-screen bg-slate-900 text-white flex">
            <Toaster position="top-right" />
            <TicketModalWrapper />

            {/* Sidebar (Desktop) */}
            <Sidebar session={session} />

            {/* Mobile Bottom Nav */}
            <MobileNav />

            {/* Main Content */}
            <main className="flex-1 lg:pl-64 pb-20 lg:pb-0">
                {children}
                <Analytics />
            </main>
        </div>
    );
}
