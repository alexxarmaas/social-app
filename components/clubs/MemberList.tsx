"use client";

import Image from "next/image";
import Link from "next/link";
import { manageMember } from "@/app/actions/club";
import { MdCheck, MdClose, MdDelete } from "react-icons/md";

interface MemberListProps {
    members: any[];
    clubId: string;
    isAdmin: boolean;
}

export default function MemberList({ members, clubId, isAdmin }: MemberListProps) {
    const handleAction = async (memberId: string, action: "approve" | "reject" | "kick") => {
        if (confirm(`¿Estás seguro de que quieres ${action === "approve" ? "aprobar" : "eliminar"} a este usuario?`)) {
            await manageMember(clubId, memberId, action);
        }
    };

    const pendingMembers = members.filter(m => m.status === "pending");
    const approvedMembers = members.filter(m => m.status === "approved");

    return (
        <div className="space-y-6">
            {isAdmin && pendingMembers.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-yellow-500/30 p-4">
                    <h3 className="text-yellow-500 font-bold mb-4">Solicitudes Pendientes</h3>
                    <div className="space-y-3">
                        {pendingMembers.map((member) => (
                            <div key={member.id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden relative">
                                        {member.user.avatar ? (
                                            <Image src={member.user.avatar} alt={member.user.username} fill className="object-contain" unoptimized />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">👤</div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">{member.user.name || member.user.username}</p>
                                        <p className="text-slate-400 text-xs">@{member.user.username}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAction(member.id, "approve")}
                                        className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30"
                                    >
                                        <MdCheck />
                                    </button>
                                    <button
                                        onClick={() => handleAction(member.id, "reject")}
                                        className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30"
                                    >
                                        <MdClose />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
                <h3 className="text-white font-bold mb-4">Miembros ({approvedMembers.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {approvedMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg">
                            <Link href={`/profile/${member.user.username}`} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden relative">
                                    {member.user.avatar ? (
                                        <Image src={member.user.avatar} alt={member.user.username} fill className="object-contain" unoptimized />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">👤</div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-semibold flex items-center gap-2">
                                        {member.user.name || member.user.username}
                                        {member.role === "admin" && <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full">Admin</span>}
                                    </p>
                                    <p className="text-slate-400 text-xs">@{member.user.username}</p>
                                </div>
                            </Link>
                            {isAdmin && member.role !== "admin" && (
                                <button
                                    onClick={() => handleAction(member.id, "kick")}
                                    className="text-slate-500 hover:text-red-500 transition-colors"
                                >
                                    <MdDelete />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
