"use client";

import { useState } from "react";
import { MdGridOn, MdEvent, MdPeople, MdDirectionsCar, MdChat } from "react-icons/md";
import ClubFeed from "./ClubFeed";
import EventCard from "@/components/events/EventCard";
import GarageGrid from "@/components/profile/GarageGrid";
import ClubChat from "@/components/clubs/ClubChat";
import MemberList from "./MemberList";

interface ClubContentProps {
    clubId: string;
    currentUser: any;
    initialEvents: any[];
    members: any[];
    clubCars: any[];
}

export default function ClubContent({ clubId, currentUser, initialEvents, members, clubCars }: ClubContentProps) {
    const [activeTab, setActiveTab] = useState<"feed" | "events" | "members" | "garage" | "chat">("feed");

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
                {/* Tabs */}
                <div className="flex gap-4 border-b border-slate-700 pb-2 overflow-x-auto scrollbar-hide">
                    <button
                        onClick={() => setActiveTab("feed")}
                        className={`font-bold pb-2 flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === "feed"
                            ? "text-red-500 border-b-2 border-red-500"
                            : "text-slate-400 hover:text-white"
                            }`}
                    >
                        <MdGridOn /> Feed
                    </button>
                    <button
                        onClick={() => setActiveTab("chat")}
                        className={`font-bold pb-2 flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === "chat"
                            ? "text-blue-500 border-b-2 border-blue-500"
                            : "text-slate-400 hover:text-white"
                            }`}
                    >
                        <MdChat /> Chat
                    </button>
                    <button
                        onClick={() => setActiveTab("events")}
                        className={`font-bold pb-2 flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === "events"
                            ? "text-red-500 border-b-2 border-red-500"
                            : "text-slate-400 hover:text-white"
                            }`}
                    >
                        <MdEvent /> Eventos
                    </button>
                    <button
                        onClick={() => setActiveTab("garage")}
                        className={`font-bold pb-2 flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === "garage"
                            ? "text-red-500 border-b-2 border-red-500"
                            : "text-slate-400 hover:text-white"
                            }`}
                    >
                        <MdDirectionsCar /> Garaje
                    </button>
                    <button
                        onClick={() => setActiveTab("members")}
                        className={`lg:hidden font-bold pb-2 flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === "members"
                            ? "text-red-500 border-b-2 border-red-500"
                            : "text-slate-400 hover:text-white"
                            }`}
                    >
                        <MdPeople /> Miembros
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                    {activeTab === "feed" && (
                        <ClubFeed clubId={clubId} isMember={currentUser.isMember} />
                    )}

                    {activeTab === "chat" && (
                        <ClubChat clubId={clubId} currentUser={currentUser} />
                    )}

                    {activeTab === "events" && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <MdEvent className="text-red-500" />
                                Eventos del Club
                            </h2>
                            <div className="grid grid-cols-1 gap-6">
                                {initialEvents.length > 0 ? (
                                    initialEvents.map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-slate-500">
                                        No hay eventos programados
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "garage" && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <MdDirectionsCar className="text-red-500" />
                                Garaje del Club
                            </h2>
                            <GarageGrid cars={clubCars} isOwner={false} hideHeader={true} />
                        </div>
                    )}

                    {activeTab === "members" && (
                        <div className="lg:hidden">
                            <MemberList members={members} clubId={clubId} isAdmin={currentUser.isAdmin} />
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar (Always visible on Desktop) */}
            <div className="hidden lg:block space-y-6">
                <MemberList members={members} clubId={clubId} isAdmin={currentUser.isAdmin} />
            </div>
        </div>
    );
}
