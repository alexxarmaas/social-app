import { getEvents } from "@/app/actions/event";
import EventCard from "@/components/events/EventCard";
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events && events.length > 0 ? (
                    events.map((event) => (
                        <EventCard key={event.id} event={event} currentUserId={session?.user?.id} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-800 border-dashed">
                        <p className="text-xl text-slate-400 mb-2">No hay eventos próximos</p>
                        <p className="text-slate-500 text-sm">¡Sé el primero en crear uno!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
