"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getConversations } from "@/app/actions/message";
import { getUserProfile } from "@/app/actions/profile";
import ConversationList from "@/components/messages/ConversationList";
import ChatWindow from "@/components/messages/ChatWindow";

export default function MessagesPage() {
    const searchParams = useSearchParams();
    const selectedId = searchParams.get("id");

    const [conversations, setConversations] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        init();
    }, [selectedId]);

    const init = async () => {
        // Get current user
        const profile = await getUserProfile();
        if (profile.user) {
            setCurrentUser(profile.user);
        }

        // Get conversations
        const result = await getConversations();
        if (result.conversations) {
            setConversations(result.conversations);
        }

        setLoading(false);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-white">Cargando mensajes...</div>;
    }

    if (!currentUser) {
        return <div className="min-h-screen flex items-center justify-center text-white">Inicia sesión para ver tus mensajes</div>;
    }

    const selectedConversation = conversations.find(c => c.id === selectedId);

    return (
        <div className="w-full h-[calc(100dvh-80px)] lg:h-screen flex overflow-hidden">
            {/* Conversation List - Hidden on mobile if chat is open */}
            <div className={`w-full lg:w-80 flex-shrink-0 h-full ${selectedId ? "hidden lg:flex" : "flex"}`}>
                <ConversationList
                    conversations={conversations}
                    selectedId={selectedId || undefined}
                />
            </div>

            {/* Chat Window - Hidden on mobile if no chat selected */}
            <div className={`flex-1 h-full bg-slate-900 flex flex-col ${!selectedId ? "hidden lg:flex" : "flex"}`}>
                {selectedId && selectedConversation ? (
                    <ChatWindow
                        conversationId={selectedId}
                        currentUser={currentUser}
                        otherUser={selectedConversation.otherUser}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500 h-full">
                        <div className="text-center w-full">
                            <div className="text-6xl mb-4">💬</div>
                            <p>Selecciona una conversación para empezar a chatear</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
