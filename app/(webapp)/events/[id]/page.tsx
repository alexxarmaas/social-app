import { getEvent } from "@/app/actions/event";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import Image from "next/image";
import { MdLocationOn, MdCalendarToday, MdPeople, MdAttachMoney } from "react-icons/md";
import EventGallery from "@/components/events/EventGallery";
import RouteDisplay from "@/components/events/RouteDisplay";
import { notFound } from "next/navigation";

export default async function EventPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const { event, error } = await getEvent(params.id);

    if (error || !event) {
        notFound();
    }

    const isAttendee = event.attendees.some((a: any) => a.userId === session?.user?.id);
    const isCreator = event.creatorId === session?.user?.id;
    const canUpload = !!session && (isAttendee || isCreator);

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Banner */}
            <div className="relative h-[300px] md:h-[400px] w-full">
                <Image
                    src={event.imageUrl || "/images/event-placeholder.jpg"}
                    alt={event.title}
                    fill
                    className="object-fill"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold mb-3 uppercase tracking-wider">
                                {event.eventType}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 font-aeroblade tracking-wide">
                                {event.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-slate-300 text-sm md:text-base">
                                <div className="flex items-center gap-1">
                                    <MdCalendarToday className="text-red-500" />
                                    {new Date(event.startDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                    <MdLocationOn className="text-red-500" />
                                    {event.location}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Description */}
                    <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
                        <h2 className="text-xl font-bold text-white mb-4">Sobre el Evento</h2>
                        <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {event.description || "Sin descripción disponible."}
                        </p>
                    </div>

                    {/* Route (if exists) */}
                    {event.route && <RouteDisplay route={event.route} />}

                    {/* Gallery */}
                    <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
                        <EventGallery eventId={event.id} isAttendee={isAttendee} isCreator={isCreator} canUpload={canUpload} />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Details Card */}
                    <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 space-y-4">
                        <h3 className="text-lg font-bold text-white mb-2">Detalles</h3>

                        <div className="flex items-center justify-between py-2 border-b border-slate-800">
                            <div className="flex items-center gap-2 text-slate-400">
                                <MdAttachMoney size={20} />
                                <span>Precio</span>
                            </div>
                            <span className="text-white font-bold">
                                {event.price > 0 ? `${event.price}€` : "Gratis"}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-slate-800">
                            <div className="flex items-center gap-2 text-slate-400">
                                <MdPeople size={20} />
                                <span>Asistentes</span>
                            </div>
                            <span className="text-white font-bold">
                                {event.attendees.length} / {event.maxAttendees || "∞"}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-slate-800">
                            <div className="flex items-center gap-2 text-slate-400">
                                <MdLocationOn size={20} />
                                <span>Dirección</span>
                            </div>
                            <span className="text-white text-right text-sm max-w-[50%]">
                                {event.address || event.location}
                            </span>
                        </div>
                    </div>

                    {/* Creator Card */}
                    {event.creator && (
                        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
                            <h3 className="text-lg font-bold text-white mb-4">Organizado por</h3>
                            <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-800">
                                    {event.creator.avatar ? (
                                        <Image src={event.creator.avatar} alt={event.creator.username} fill className="object-fill" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xl">
                                            {event.creator.username[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-bold">{event.creator.username}</p>
                                    <p className="text-xs text-slate-400">Organizador</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
