import dynamic from "next/dynamic";
import { getPosts } from "@/app/actions/post";
import Image from "next/image";
import CreatePostClientWrapper from "@/components/CreatePostClientWrapper";
import PostCard from "@/components/feed/PostCard";

export default async function FeedPage() {
    const { posts = [], error } = await getPosts();

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 z-40">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                        Tramassso
                    </h1>
                </div>
            </header>

            {/* Feed Content */}
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                {/* Create Post Component */}
                <CreatePostClientWrapper />
                {error && (
                    <div className="text-red-500">{error}</div>
                )}
                {posts.length === 0 && !error && (
                    <div className="text-slate-400 text-center py-8">No hay publicaciones aún.</div>
                )}
                {posts.map((post: any) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}
