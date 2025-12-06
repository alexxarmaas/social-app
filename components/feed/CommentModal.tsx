"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";
import CommentsSection from "./CommentsSection";

interface CommentModalProps {
    postId: string;
    onClose: () => void;
    onCommentChange: (change: number) => void;
}

export default function CommentModal({ postId, onClose, onCommentChange }: CommentModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="bg-slate-800 rounded-xl max-w-md w-full border border-slate-700 relative overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Comentarios</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <MdClose size={24} />
                    </button>
                </div>

                <CommentsSection
                    postId={postId}
                    onCommentChange={onCommentChange}
                />
            </div>
        </div>,
        document.body
    );
}
