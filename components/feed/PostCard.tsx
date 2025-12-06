"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdFavorite, MdFavoriteBorder, MdChatBubbleOutline, MdShare, MdMoreHoriz } from "react-icons/md";
import { toggleLike } from "@/app/actions/post";
import CommentModal from "./CommentModal";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

interface PostCardProps {
    post: any;
    onCommentClick?: () => void;
    disableCommentModal?: boolean;
}

export default function PostCard({ post, onCommentClick, disableCommentModal = false }: PostCardProps) {
    const { data: session } = useSession();
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post.likesCount);
    const [commentsCount, setCommentsCount] = useState(post.commentsCount);
    const [showComments, setShowComments] = useState(false);
    const [isLikeLoading, setIsLikeLoading] = useState(false);

    const handleLike = async () => {
        if (!session) {
            toast.error("Debes iniciar sesión para dar like");
            return;
        }

        if (isLikeLoading) return;

        // Optimistic update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount((prev: number) => newIsLiked ? prev + 1 : prev - 1);
        setIsLikeLoading(true);

        const result = await toggleLike(post.id);

        if (result.error) {
            // Revert on error
            setIsLiked(!newIsLiked);
            setLikesCount((prev: number) => !newIsLiked ? prev + 1 : prev - 1);
            toast.error(result.error);
        }

        setIsLikeLoading(false);
    };

    const handleCommentClick = () => {
        if (!session) {
            toast.error("Debes iniciar sesión para comentar");
            return;
        }

        if (onCommentClick) {
            onCommentClick();
            return;
        }

        if (!disableCommentModal) {
            setShowComments(true);
        }
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/post/${post.id}`;
        const shareData = {
            title: `Post de ${post.author?.username || 'Usuario'} en Tramassso`,
            text: post.content,
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareUrl);
                toast.success("Enlace copiado al portapapeles");
            }
        } catch (err) {
            console.error("Error sharing:", err);
            // Ignore abort errors (user cancelled share)
            if ((err as Error).name !== 'AbortError') {
                toast.error("Error al compartir");
            }
        }
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={`/profile/${post.author?.username}`} className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden relative hover:opacity-80 transition-opacity">
                        {post.author?.avatar ? (
                            <Image src={post.author.avatar} alt={post.author.name || post.author.username} fill className="object-fill" unoptimized />
                        ) : (
                            (post.author?.name?.[0] || post.author?.username?.[0] || "U")
                        )}
                    </Link>
                    <div>
                        <Link href={`/profile/${post.author?.username}`} className="text-white font-semibold hover:underline">
                            {post.author?.name || post.author?.username || "Usuario"}
                        </Link>
                        <p className="text-slate-400 text-sm">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                </div>
                <button className="text-slate-400 hover:text-white">
                    <MdMoreHoriz size={24} />
                </button>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-4">
                <p className="text-slate-200 whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Post Image */}
            {post.imageUrl && (
                <div className="relative aspect-video w-full bg-slate-900">
                    <Image
                        src={post.imageUrl}
                        alt="Post content"
                        fill
                        className="object-contain object-center"
                        unoptimized
                    />
                </div>
            )}

            {/* Post Actions */}
            <div className="p-4 border-t border-slate-700 flex items-center justify-between text-slate-400">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 hover:text-red-500 transition-colors ${isLiked ? "text-red-500" : ""}`}
                >
                    {isLiked ? <MdFavorite size={24} /> : <MdFavoriteBorder size={24} />}
                    <span>{likesCount}</span>
                </button>
                <button
                    onClick={handleCommentClick}
                    className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                >
                    <MdChatBubbleOutline size={22} />
                    <span>{commentsCount}</span>
                </button>
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 hover:text-green-400 transition-colors"
                >
                    <MdShare size={22} />
                </button>
            </div>

            {showComments && (
                <CommentModal
                    postId={post.id}
                    onClose={() => setShowComments(false)}
                    onCommentChange={(change: number) => setCommentsCount((prev: number) => prev + change)}
                />
            )}
        </div>
    );
}
