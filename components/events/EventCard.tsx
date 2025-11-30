"use client";

import { MdLocationOn, MdCalendarToday, MdPeople, MdQrCodeScanner, MdEdit, MdDelete } from "react-icons/md";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import TicketModal from "./TicketModal";
import { rsvpEvent, deleteEvent } from "@/app/actions/event";
import { toast } from "react-hot-toast";
import Image from "next/image";
import EditEventModal from "./EditEventModal";

interface EventCardProps {
    event: any;
    currentUserId?: string;
}

export default function EventCard({ event, currentUserId }: EventCardProps) {
    const [loading, setLoading] = useState(false);
    const [showTicket, setShowTicket] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const { data: session } = useSession();

    // Check if current user is attending
    const isAttending = event.attendees.some((a: any) => a.userId === currentUserId);
    const isFull = event.maxAttendees && event._count.attendees >= event.maxAttendees;
    const userRsvp = event.attendees.find((a: any) => a.userId === currentUserId);

    // Check permissions
    const isCreator = event.creatorId === currentUserId;
    const isClubAdmin = event.club?.members?.some((m: any) => m.userId === currentUserId && ['admin', 'owner'].includes(m.role));

    const handleRsvp = async (status: string) => {
        if (!currentUserId) {
            toast.error("Debes iniciar sesión para unirte");
            return;
        }

        setLoading(true);
        const result = await rsvpEvent(event.id, status);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(status === 'going' ? "¡Te has unido al evento!" : "Has cambiado tu asistencia");
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de que quieres eliminar este evento?")) return;

        setDeleteLoading(true);
        const result = await deleteEvent(event.id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Evento eliminado");
        }
        setDeleteLoading(false);
    };

    const date = new Date(event.startDate);
    const formattedDate = date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    const formattedTime = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden hover:border-red-500/50 transition-colors group flex flex-col h-full">
            {/* Image */}
            <div className="aspect-video bg-slate-700 relative">
                {event.imageUrl ? (
                    <Image src={event.imageUrl} alt={event.title} fill className="object-contain" unoptimized />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-slate-800 to-slate-900">
                        🗓️
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                    {event.eventType}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-lg font-bold text-white font-aeroblade tracking-wide leading-tight">{event.title}</h3>
                        {event.club && (
                            <span className="text-xs text-red-400 font-medium">{event.club.name}</span>
                        )}
                    </div>
                    <div className="text-center bg-slate-700/50 rounded p-1 min-w-[50px]">
                        <div className="text-xs text-red-400 font-bold uppercase">{date.toLocaleDateString('es-ES', { month: 'short' })}</div>
                        <div className="text-lg font-bold text-white leading-none">{date.getDate()}</div>
                    </div>
                </div>

                <div className="space-y-2 text-sm text-slate-400 mb-4 flex-1">
                    <div className="flex items-center gap-2">
                        <MdCalendarToday className="text-red-500" />
                        <span>{formattedDate} • {formattedTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MdLocationOn className="text-red-500" />
                        <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MdPeople className="text-red-500" />
                        <span>
                            {event._count.attendees}
                            {event.maxAttendees ? ` / ${event.maxAttendees}` : ""} asistentes
                        </span>
                    </div>
                </div>

                {/* Attendees Preview */}
                <div className="h-8 mb-4 flex -space-x-2 overflow-hidden items-center">
                    {event.attendees.length > 0 ? (
                        <>
                            {event.attendees.slice(0, 5).map((attendee: any, i: number) => (
                                <div key={i} className="w-6 h-6 rounded-full border border-slate-800 bg-slate-700 relative overflow-hidden">
                                    {attendee.user.avatar && (
                                        <Image src={attendee.user.avatar} alt="User" fill className="object-contain" unoptimized />
                                    )}
                                </div>
                            ))}
                            {event._count.attendees > 5 && (
                                <div className="w-6 h-6 rounded-full border border-slate-800 bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold">
                                    +{event._count.attendees - 5}
                                </div>
                            )}
                        </>
                    ) : (
                        <span className="text-xs text-slate-600 italic pl-1">Sé el primero en unirte</span>
                    )}
                </div>

                {/* Action */}
                <div className="flex gap-2">
                    {/* Manage Button */}
                    {(isCreator || isClubAdmin) && (
                        <>
                            <Link
                                href={`/events/${event.id}/manage`}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <MdQrCodeScanner />
                                Gestionar
                            </Link>
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors"
                                title="Editar Evento"
                            >
                                <MdEdit size={20} />
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="bg-red-900/50 hover:bg-red-900 text-red-200 p-2 rounded-lg transition-colors disabled:opacity-50"
                                title="Eliminar Evento"
                            >
                                {deleteLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MdDelete size={20} />}
                            </button>
                        </>
                    )}

                    {/* View Ticket Button */}
                    {isAttending && !isCreator && !isClubAdmin && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setShowTicket(true);
                            }}
                            className="w-12 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                            title="Ver Entrada"
                        >
                            🎟️
                        </button>
                    )}

                    {/* RSVP Button */}
                    {!isCreator && !isClubAdmin && (
                        <button
                            onClick={() => handleRsvp(isAttending ? "not_going" : "going")}
                            disabled={loading || (!isAttending && isFull)}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed ${isAttending
                                ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                : (!isFull ? "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg hover:shadow-red-500/50" : "bg-slate-800 text-slate-500")
                                }`}
                        >
                            {loading ? "..." : (isAttending ? "Ya estás apuntado" : (isFull ? "Completo" : (event.price > 0 ? `Comprar (${event.price}€)` : "Asistiré (Gratis)")))}
                        </button>
                    )}
                </div>
            </div>

            <TicketModal
                isOpen={showTicket}
                onClose={() => setShowTicket(false)}
                event={event}
                ticketCode={userRsvp?.ticketCode || ""}
            />

            <EditEventModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                event={event}
                onUpdate={() => {
                    // Optional: trigger a refresh if needed, but revalidatePath should handle it
                }}
            />
        </div>
    );
}
