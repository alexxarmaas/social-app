"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MdSend, MdDelete } from "react-icons/md";
import { getComments, addComment, deleteComment } from "@/app/actions/post";
import { useSession } from "next-auth/react";
import toast from 'react-hot-toast';
import { useRouter } from "next/navigation";
import { handleUnauth } from '@/components/auth/handleUnauth';

interface CommentsSectionProps {
    postId: string;
    onCommentChange?: (change: number) => void;
    className?: string;
}

export default function CommentsSection({ postId, onCommentChange, className = "" }: CommentsSectionProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        const result = await getComments(postId);
        if (result.comments) {
            setComments(result.comments);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        const result = await addComment(postId, newComment);
        if (result.error) {
            if (handleUnauth(result, router, `/post/${postId}`)) return;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any)?.toast?.error?.(result.error as string);
        } else if (result.success && result.comment) {
            setComments([result.comment, ...comments]);
            setNewComment("");
            if (onCommentChange) onCommentChange(1);
        }
        setSubmitting(false);
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm("¿Estás seguro de eliminar este comentario?")) return;

        const result = await deleteComment(commentId);
        if (result.error) {
            if (handleUnauth(result, router, `/post/${postId}`)) return;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any)?.toast?.error?.(result.error as string);
        } else if (result.success) {
            setComments(comments.filter(c => c.id !== commentId));
            if (onCommentChange) onCommentChange(-1);
        }
    };

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
                {loading ? (
                    <div className="text-center text-slate-400 py-4">Cargando comentarios...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">No hay comentarios aún. ¡Sé el primero!</div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden flex-shrink-0 relative">
                                {comment.author.avatar ? (
                                    <Image src={comment.author.avatar} alt={comment.author.name} fill className="object-fill" unoptimized />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm">👤</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="bg-slate-700/50 rounded-lg p-3">
                                    <div className="flex justify-between items-start">
                                        <span className="font-semibold text-white text-sm">{comment.author.name || comment.author.username}</span>
                                        <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-slate-300 text-sm mt-1">{comment.content}</p>
                                </div>
                                {session?.user?.id === comment.author.id && (
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        className="text-xs text-red-400 hover:text-red-300 mt-1 ml-2 flex items-center gap-1"
                                    >
                                        <MdDelete /> Eliminar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {session ? (
                <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700 bg-slate-800/50">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Escribe un comentario..."
                            className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                            disabled={submitting}
                        />
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <MdSend size={20} />
                        </button>
                    </div>
                </form>
            ) : (
                <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                    <button
                        onClick={() => router.push(`/login?callbackUrl=/post/${postId}`)}
                        className="w-full bg-slate-700 text-slate-300 py-2 rounded-lg hover:bg-slate-600 transition-colors font-medium"
                    >
                        Inicia sesión para comentar
                    </button>
                </div>
            )}
        </div>
    );
}
