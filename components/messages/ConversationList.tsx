"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ConversationList({
    conversations,
    selectedId
}: {
    conversations: any[],
    selectedId?: string
}) {
    const router = useRouter();

    return (
        <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
            <div className="h-16 px-4 border-b border-slate-800 flex items-center">
                <h2 className="text-xl font-bold text-white">Mensajes</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">
                        No tienes mensajes aún.
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => router.push(`/messages?id=${conv.id}`)}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition-colors ${selectedId === conv.id ? "bg-slate-800 border-l-4 border-red-500" : "border-l-4 border-transparent"
                                }`}
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden relative flex-shrink-0">
                                {conv.otherUser?.avatar ? (
                                    <Image
                                        src={conv.otherUser.avatar}
                                        alt={conv.otherUser.name}
                                        fill
                                        className="object-fill"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline gap-2">
                                    <h3 className="font-bold text-white truncate">{conv.otherUser?.name || "Usuario"}</h3>
                                    {conv.lastMessage && (
                                        <span className="text-xs text-slate-500">
                                            {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                {conv.lastMessage && (
                                    <p className={`text-sm truncate ${!conv.lastMessage.read && !conv.lastMessage.isMine
                                        ? "text-white font-bold"
                                        : "text-slate-400"
                                        }`}>
                                        {conv.lastMessage.isMine && "Tú: "}
                                        {conv.lastMessage.content}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
