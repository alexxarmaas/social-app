import { getPost } from "@/app/actions/post";
import PostCard from "@/components/feed/PostCard";
import CommentsSection from "@/components/feed/CommentsSection";
import Link from "next/link";
import { MdArrowBack } from "react-icons/md";
import { notFound } from "next/navigation";

interface PostPageProps {
    params: {
        id: string;
    };
}

export default async function PostPage({ params }: PostPageProps) {
    const { post, error } = await getPost(params.id);

    if (error || !post) {
        notFound();
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="sticky top-0 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 z-40">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/feed" className="text-slate-400 hover:text-white transition-colors">
                        <MdArrowBack size={24} />
                    </Link>
                    <h1 className="text-xl font-bold text-white">Publicación</h1>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                <PostCard post={post} disableCommentModal={true} />

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-700">
                        <h2 className="text-lg font-bold text-white">Comentarios</h2>
                    </div>
                    <CommentsSection postId={post.id} />
                </div>
            </div>
        </div>
    );
}
