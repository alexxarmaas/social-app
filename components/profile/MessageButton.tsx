"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startConversation } from "@/app/actions/message";
import { MdMessage } from "react-icons/md";
import toast from "react-hot-toast";

interface MessageButtonProps {
    userId: string;
}

export default function MessageButton({ userId }: MessageButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleMessage = async () => {
        setLoading(true);
        try {
            const result = await startConversation(userId);
            if (result.error) {
                toast.error(result.error);
            } else if (result.conversationId) {
                router.push(`/messages?id=${result.conversationId}`);
            }
        } catch (error) {
            console.error("Error starting conversation:", error);
            toast.error("Error al iniciar conversación");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleMessage}
            disabled={loading}
            className="px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 bg-slate-700 text-white hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <MdMessage /> {loading ? "Cargando..." : "Mensaje"}
        </button>
    );
}
