import { getEvents } from "@/app/actions/event";
import CalendarGrid from "@/components/events/CalendarGrid";
import CreateEventButton from "@/components/events/CreateEventButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export default async function CalendarPage() {
    const { events } = await getEvents('upcoming');
    const session = await getServerSession(authOptions);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white font-aeroblade tracking-wide mb-2">Calendario</h1>
                    <p className="text-slate-400">Próximos eventos, KDDs y tandas.</p>
                </div>
                <CreateEventButton />
            </div>

            {/* Events Grid */}
            <CalendarGrid events={events || []} currentUserId={session?.user?.id} />
        </div>
    );
}
