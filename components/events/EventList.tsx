"use client";

import { useState } from "react";
import CreateEventModal from "./CreateEventModal";
import Image from "next/image";
import { joinEvent } from "@/app/actions/event";
import { deleteClubEvent, leaveClubEvent } from "@/app/actions/club";
import { MdEdit, MdDelete, MdExitToApp, MdCheckCircle } from "react-icons/md";

interface EventListProps {
    events: any[];
    adminClubs: any[];
}

export default function EventList({ events, adminClubs }: EventListProps) {
    const [showModal, setShowModal] = useState(false);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleJoin = async (id: string, isClubEvent: boolean, clubId?: string) => {
        setLoadingId(id);
        if (isClubEvent && clubId) {
            // Use club action if it's a club event (though joinEvent might handle it if generic)
            // Actually, joinEvent in event.ts is generic. Let's use that for now unless we need specific club logic.
            // But wait, the previous task added joinClubEvent. Let's use that if it's a club event.
            // We need to import joinClubEvent.
            // Actually, let's stick to the generic joinEvent for now if it works, OR import joinClubEvent.
            // The user wants "create, modify and delete". Join is already there.
            // Let's use the generic joinEvent for simplicity unless it breaks.
            await joinEvent(id);
        } else {
            await joinEvent(id);
        }
        setLoadingId(null);
    };

    const handleDelete = async (eventId: string, clubId: string) => {
        if (confirm("¿Estás seguro de que quieres eliminar este evento?")) {
            await deleteClubEvent(eventId, clubId);
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Próximos Eventos</h2>
                {adminClubs.length > 0 && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all"
                    >
                        + Crear Evento
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {events.map((event) => (
                    <div key={event.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden flex flex-col md:flex-row relative group">
                        <div className="md:w-48 h-32 md:h-auto bg-slate-700 relative">
                            {event.imageUrl ? (
                                <Image src={event.imageUrl} alt={event.title} fill className="object-contain" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl">📅</div>
                            )}
                            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-center min-w-[50px]">
                                <div className="text-xs font-bold uppercase">{new Date(event.startDate).toLocaleString('es-ES', { month: 'short' })}</div>
                                <div className="text-xl font-bold">{new Date(event.startDate).getDate()}</div>
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-white font-bold text-lg">{event.title}</h3>
                                        {event.club && (
                                            <p className="text-xs text-slate-400 mb-1">Organizado por {event.club.name}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full uppercase h-fit">{event.eventType}</span>
                                        {event.canEdit && event.clubId && (
                                            <button
                                                onClick={() => handleDelete(event.id, event.clubId)}
                                                className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                                                title="Eliminar"
                                            >
                                                <MdDelete size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm mt-1">📍 {event.location}</p>
                                <p className="text-slate-300 text-sm mt-2 line-clamp-2">{event.description}</p>
                            </div>

                            <div className="flex items-center justify-between mt-4 border-t border-slate-700 pt-3">
                                <div className="flex -space-x-2">
                                    {event.attendees.map((attendee: any, i: number) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-800 bg-slate-700 relative overflow-hidden">
                                            {attendee.user.avatar && <Image src={attendee.user.avatar} alt="User" fill className="object-contain" />}
                                        </div>
                                    ))}
                                    {event._count.attendees > 3 && (
                                        <div className="w-8 h-8 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-xs text-white">
                                            +{event._count.attendees - 3}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleJoin(event.id, !!event.clubId, event.clubId)}
                                    disabled={loadingId === event.id}
                                    className={`px-4 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${event.isAttending
                                        ? "bg-slate-700 text-white hover:bg-slate-600"
                                        : "bg-red-600 text-white hover:bg-red-500"
                                        }`}
                                >
                                    {loadingId === event.id ? "..." : (
                                        event.isAttending ? <><MdExitToApp /> No asistiré</> : <><MdCheckCircle /> Asistiré</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && <CreateEventModal onClose={() => setShowModal(false)} adminClubs={adminClubs} />}
        </>
    );
}
