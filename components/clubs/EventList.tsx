"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { createClubEvent, deleteClubEvent, updateClubEvent, joinClubEvent, leaveClubEvent } from "@/app/actions/club";
import { MdEvent, MdAdd, MdLocationOn, MdAccessTime, MdPeople, MdEdit, MdDelete, MdClose, MdCheckCircle, MdExitToApp } from "react-icons/md";

interface EventListProps {
    events: any[];
    clubId: string;
    isAdmin: boolean;
    currentUserId?: string;
}

export default function EventList({ events, clubId, isAdmin, currentUserId }: EventListProps) {
    const { data: session } = useSession();
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [loadingEventId, setLoadingEventId] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        if (editingEvent) {
            await updateClubEvent(editingEvent.id, clubId, formData);
        } else {
            await createClubEvent(clubId, formData);
        }
        setShowModal(false);
        setEditingEvent(null);
    };

    const handleDelete = async (eventId: string) => {
        if (confirm("¿Estás seguro de que quieres eliminar este evento?")) {
            await deleteClubEvent(eventId, clubId);
        }
    };

    const handleJoin = async (eventId: string) => {
        setLoadingEventId(eventId);
        await joinClubEvent(eventId, clubId);
        setLoadingEventId(null);
    };

    const handleLeave = async (eventId: string) => {
        setLoadingEventId(eventId);
        await leaveClubEvent(eventId, clubId);
        setLoadingEventId(null);
    };

    const openEditModal = (event: any) => {
        setEditingEvent(event);
        setShowModal(true);
    };

    const openCreateModal = () => {
        setEditingEvent(null);
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            {(session && isAdmin) && (
                <button
                    onClick={openCreateModal}
                    className="w-full py-3 bg-slate-800 border border-dashed border-slate-600 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 transition-colors flex items-center justify-center gap-2"
                >
                    <MdAdd /> Crear Nuevo Evento
                </button>
            )}

            <div className="space-y-4">
                {events.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <MdEvent className="mx-auto text-4xl mb-2" />
                        <p>No hay eventos próximos</p>
                    </div>
                ) : (
                    events.map((event) => {
                        const isAttending = event.attendees?.some((a: any) => a.userId === currentUserId);
                        const isFull = event.maxAttendees && event.attendees?.length >= event.maxAttendees;
                        const isLoading = loadingEventId === event.id;

                        return (
                            <div key={event.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 flex gap-4 relative group">
                                <div className="bg-slate-700 rounded-lg p-3 text-center min-w-[80px] h-fit">
                                    <span className="block text-red-500 font-bold text-xl">
                                        {new Date(event.startDate).getDate()}
                                    </span>
                                    <span className="block text-slate-300 text-xs uppercase">
                                        {new Date(event.startDate).toLocaleString('es-ES', { month: 'short' })}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-white font-bold text-lg">{event.title}</h3>
                                        {(session && isAdmin) && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(event)}
                                                    className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                                                    title="Editar"
                                                >
                                                    <MdEdit size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(event.id)}
                                                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <MdDelete size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-slate-400 text-sm mb-2">{event.description}</p>
                                    <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-4">
                                        <span className="flex items-center gap-1"><MdLocationOn /> {event.location}</span>
                                        <span className="flex items-center gap-1"><MdAccessTime /> {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {event.maxAttendees && (
                                            <span className={`flex items-center gap-1 ${isFull ? 'text-red-400' : ''}`}>
                                                <MdPeople />
                                                {event.attendees?.length || 0} / {event.maxAttendees}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    {currentUserId && (
                                        <div className="flex gap-2">
                                            {isAttending ? (
                                                <button
                                                    onClick={() => handleLeave(event.id)}
                                                    disabled={isLoading}
                                                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-600 transition-colors flex items-center gap-2"
                                                >
                                                    {isLoading ? "..." : <><MdExitToApp /> No asistiré</>}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleJoin(event.id)}
                                                    disabled={isLoading || (isFull && !isAttending)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${isFull
                                                            ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                                            : "bg-red-600 text-white hover:bg-red-500"
                                                        }`}
                                                >
                                                    {isLoading ? "..." : (isFull ? "Completo" : <><MdCheckCircle /> Asistiré</>)}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-700 p-6 relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <MdClose size={24} />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-4">
                            {editingEvent ? "Editar Evento" : "Crear Evento"}
                        </h2>

                        <form key={editingEvent?.id || 'new'} action={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="title"
                                defaultValue={editingEvent?.title}
                                placeholder="Título del evento"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                            <textarea
                                name="description"
                                defaultValue={editingEvent?.description}
                                placeholder="Descripción"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white h-24 focus:outline-none focus:border-red-500"
                            ></textarea>
                            <input
                                type="text"
                                name="location"
                                defaultValue={editingEvent?.location}
                                placeholder="Ubicación"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="date"
                                    name="date"
                                    defaultValue={editingEvent ? new Date(editingEvent.startDate).toISOString().split('T')[0] : ''}
                                    required
                                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                                />
                                <input
                                    type="time"
                                    name="time"
                                    defaultValue={editingEvent ? new Date(editingEvent.startDate).toTimeString().slice(0, 5) : ''}
                                    required
                                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    name="eventType"
                                    defaultValue={editingEvent?.eventType}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                                >
                                    <option value="meet">Car Meet</option>
                                    <option value="cruise">Ruta / Cruise</option>
                                    <option value="race">Carrera</option>
                                    <option value="show">Exhibición</option>
                                </select>
                                <input
                                    type="number"
                                    name="maxAttendees"
                                    defaultValue={editingEvent?.maxAttendees}
                                    placeholder="Máx. Asistentes (Opcional)"
                                    min="1"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-red-500/50 transition-all mt-2"
                            >
                                {editingEvent ? "Guardar Cambios" : "Crear Evento"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
