"use client";

import { useState } from "react";
import EventCard from "@/components/events/EventCard";
import EventDetailsModal from "@/components/events/EventDetailsModal";

interface CalendarGridProps {
    events: any[];
    currentUserId?: string;
}

export default function CalendarGrid({ events, currentUserId }: CalendarGridProps) {
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEventClick = (event: any) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events && events.length > 0 ? (
                    events.map((event: any) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            currentUserId={currentUserId}
                            onClick={() => handleEventClick(event)}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-800 border-dashed">
                        <p className="text-xl text-slate-400 mb-2">No hay eventos próximos</p>
                        <p className="text-slate-500 text-sm">¡Sé el primero en crear uno!</p>
                    </div>
                )}
            </div>

            <EventDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                event={selectedEvent}
            />
        </>
    );
}
