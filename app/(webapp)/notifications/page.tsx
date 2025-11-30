import NotificationList from "@/components/notifications/NotificationList";

export default function NotificationsPage() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-white mb-6">Notificaciones</h1>
            <NotificationList />
        </div>
    );
}
