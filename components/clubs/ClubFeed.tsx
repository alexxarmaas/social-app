"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { createClubPost, getClubPosts } from "@/app/actions/club";
import PostCard from "@/components/feed/PostCard";
import { MdSend, MdImage } from "react-icons/md";

interface ClubFeedProps {
    clubId: string;
    isMember: boolean;
}

export default function ClubFeed({ clubId, isMember }: ClubFeedProps) {
    const { data: session } = useSession();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        loadPosts();
    }, [clubId]);

    const loadPosts = async () => {
        const result = await getClubPosts(clubId);
        if (result.posts) {
            setPosts(result.posts);
        }
        setLoading(false);
    };

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsPosting(true);
        const formData = new FormData();
        formData.append("content", content);

        const result = await createClubPost(clubId, formData);
        if (result.success) {
            setContent("");
            loadPosts();
        } else {
            alert(result.error);
        }
        setIsPosting(false);
    };

    return (
        <div className="space-y-6">
            {/* Create Post Input */}
            {(session && isMember) && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
                    <form onSubmit={handlePost} className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Comparte algo con el club..."
                                className="w-full bg-slate-900/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 border border-slate-700"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isPosting || !content.trim()}
                            className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-3 rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50"
                        >
                            <MdSend size={20} />
                        </button>
                    </form>
                </div>
            )}

            {/* Posts List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    <p>No hay publicaciones aún.</p>
                    {(session && isMember) && <p className="text-sm mt-2">¡Sé el primero en publicar!</p>}
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
}
