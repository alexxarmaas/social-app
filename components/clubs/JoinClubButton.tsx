"use client";

import { joinClub } from "@/app/actions/club";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface JoinClubButtonProps {
    clubId: string;
    membership: any;
}

export default function JoinClubButton({ clubId, membership }: JoinClubButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleJoin = async () => {
        setLoading(true);
        const result = await joinClub(clubId);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Solicitud enviada");
        }
        setLoading(false);
    };

    if (membership) {
        if (membership.status === 'pending') {
            return (
                <button disabled className="bg-slate-700 text-slate-400 px-6 py-2 rounded-lg font-bold cursor-not-allowed">
                    Pendiente
                </button>
            );
        }
        return (
            <button disabled className="bg-slate-700 text-green-400 px-6 py-2 rounded-lg font-bold cursor-default border border-green-500/30">
                Miembro
            </button>
        );
    }

    return (
        <button
            onClick={handleJoin}
            disabled={loading}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-2 rounded-lg font-bold hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50"
        >
            {loading ? "..." : "Unirse al Club"}
        </button>
    );
}
