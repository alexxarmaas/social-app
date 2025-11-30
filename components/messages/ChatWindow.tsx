"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";
import Image from "next/image";
import { getMessages, sendMessage, markConversationAsRead } from "@/app/actions/message";
import { MdSend, MdChevronLeft } from "react-icons/md";

export default function ChatWindow({
    conversationId,
    currentUser,
    otherUser
}: {
    conversationId: string,
    currentUser: any,
    otherUser: any
}) {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        loadMessages();

        // Polling fallback for real-time updates (3s interval)
        const interval = setInterval(() => {
            loadMessages();
        }, 3000);

        // Pusher subscription
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "key", {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
        });

        const channel = pusher.subscribe(`conversation-${conversationId}`);
        channel.bind("new-message", (data: any) => {
            setMessages((prev) => {
                // Avoid duplicates if we already added it optimistically
                if (prev.find(m => m.id === data.id)) return prev;
                return [...prev, data];
            });
            // Mark as read immediately if we are viewing
            if (data.senderId !== currentUser.id) {
                markConversationAsRead(conversationId);
            }
        });

        return () => {
            clearInterval(interval);
            pusher.unsubscribe(`conversation-${conversationId}`);
        };
    }, [conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        const result = await getMessages(conversationId);
        if (result.messages) {
            setMessages(prev => {
                // Simple check to avoid unnecessary re-renders and scrolling
                if (JSON.stringify(prev) === JSON.stringify(result.messages)) {
                    return prev;
                }
                return result.messages;
            });

            // Mark as read if last message is not mine
            const lastMsg = result.messages[result.messages.length - 1];
            if (lastMsg && lastMsg.senderId !== currentUser.id && !lastMsg.read) {
                await markConversationAsRead(conversationId);
            }
        }
        setLoading(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const tempId = Date.now().toString();
        const tempMsg = {
            id: tempId,
            content: newMessage,
            createdAt: new Date(),
            senderId: currentUser.id,
            sender: currentUser
        };

        setMessages([...messages, tempMsg]);
        setNewMessage("");

        const result = await sendMessage(conversationId, otherUser.id, tempMsg.content);
        if (result.error) {
            // Handle error (maybe remove temp message)
            console.error(result.error);
        } else {
            // Refresh to get real ID
            loadMessages();
        }
    };

    if (loading) return <div className="flex-1 flex items-center justify-center text-slate-500">Cargando...</div>;

    return (
        <div className="flex flex-col h-full bg-slate-900">
            {/* Header */}
            <div className="h-16 px-4 border-b border-slate-800 flex items-center gap-4 bg-slate-900/95 backdrop-blur sticky top-0 z-10">
                <button
                    onClick={() => router.push('/messages')}
                    className="md:hidden p-2 rounded-full hover:bg-slate-800 text-slate-200 transition-colors"
                >
                    <MdChevronLeft size={32} />
                </button>

                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden relative flex-shrink-0 border border-slate-600">
                        {otherUser.avatar ? (
                            <Image src={otherUser.avatar} alt={otherUser.name} fill className="object-contain" unoptimized />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-white text-lg truncate leading-tight">{otherUser.name}</h3>
                        <p className="text-xs text-slate-400 truncate">@{otherUser.username}</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMine = msg.senderId === currentUser.id;
                    return (
                        <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMine
                                ? "bg-red-500 text-white rounded-br-none"
                                : "bg-slate-800 text-slate-200 rounded-bl-none"
                                }`}>
                                <p>{msg.content}</p>
                                <p className={`text-[10px] mt-1 text-right ${isMine ? "text-red-200" : "text-slate-500"}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-slate-800 text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <MdSend size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
}
