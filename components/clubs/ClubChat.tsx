"use client";

import { useState, useEffect, useRef } from "react";
import { getClubMessages, sendClubMessage } from "@/app/actions/chat";
import Image from "next/image";
import { MdSend } from "react-icons/md";
import { toast } from "react-hot-toast";

interface ClubChatProps {
    clubId: string;
    currentUser: any;
}

export default function ClubChat({ clubId, currentUser }: ClubChatProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        const result = await getClubMessages(clubId);
        if (result.messages) {
            setMessages(result.messages);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, [clubId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const tempMessage = {
            id: Date.now().toString(),
            content: newMessage,
            createdAt: new Date().toISOString(),
            sender: {
                id: currentUser.id,
                username: "Yo", // Placeholder
                avatar: null
            }
        };

        // Optimistic update
        setMessages([...messages, tempMessage]);
        setNewMessage("");

        const result = await sendClubMessage(clubId, newMessage);
        if (result.error) {
            toast.error(result.error);
            // Revert optimistic update (simplified: just refetch)
            fetchMessages();
        } else {
            // Replace temp message with real one
            fetchMessages();
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-slate-400">Cargando chat...</div>;
    }

    return (
        <div className="flex flex-col h-[600px] bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-500 py-10">
                        <p>No hay mensajes aún.</p>
                        <p className="text-sm">¡Sé el primero en escribir!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender.id === currentUser.id;
                        return (
                            <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                                <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden relative flex-shrink-0">
                                    {msg.sender.avatar ? (
                                        <Image src={msg.sender.avatar} alt={msg.sender.username} fill className="object-contain" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                                            {msg.sender.username?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-slate-800 text-slate-200 rounded-tl-none"}`}>
                                    {!isMe && <p className="text-xs text-slate-400 mb-1 font-bold">{msg.sender.username}</p>}
                                    <p className="text-sm break-words">{msg.content}</p>
                                    <p className="text-[10px] opacity-50 mt-1 text-right">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <MdSend size={20} />
                </button>
            </form>
        </div>
    );
}
