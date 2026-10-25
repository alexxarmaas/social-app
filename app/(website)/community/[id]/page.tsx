import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import { authOptions } from "@/app/lib/auth";
import { socialEnabled } from "@/app/lib/community-social";
import { prisma } from "@/app/lib/prisma";
import PostCard from "@/components/community/PostCard";
import CommentForm from "@/components/community/CommentForm";
import { buildPremiumMetadata } from "@/app/lib/seo";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!socialEnabled()) return { title: "Publicación no disponible", robots: { index: false } };
  const post = await prisma.post.findFirst({
    where: { id, status: "published" },
    select: { content: true, author: { select: { username: true } } },
  });
  if (!post) return { title: "Publicación no encontrada", robots: { index: false } };
  return buildPremiumMetadata({
    title: "@" + post.author.username + " · Comunidad Tramassso",
    description: post.content.slice(0, 155),
    path: "/community/" + id,
  });
}

export default async function CommunityPostPage({ params }: Props) {
  if (!socialEnabled()) notFound();
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const [post, comments] = await Promise.all([
    prisma.post.findFirst({
      where: { id, status: "published" },
      select: {
        id: true, content: true, imageUrl: true, createdAt: true,
        author: { select: { username: true, name: true } },
        _count: { select: { likes: true } },
        likes: { where: { userId: session?.user?.id || "__guest__" }, select: { id: true } },
      },
    }),
    prisma.comment.findMany({
      where: { postId: id, status: "published" },
      take: 80, orderBy: { createdAt: "asc" },
      select: {
        id: true, content: true, createdAt: true,
        author: { select: { username: true } },
      },
    }),
  ]);
  if (!post) notFound();
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-14 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/community" className="text-xs font-bold uppercase tracking-widest text-orange-400">← Volver al muro</Link>
        <h1 className="mb-8 mt-5 text-3xl font-black uppercase">Conversación</h1>
        <PostCard post={{
          id: post.id, content: post.content, imageUrl: post.imageUrl,
          createdAt: post.createdAt.toISOString(),
          author: post.author, likes: post._count.likes, liked: post.likes.length > 0,
        }} signedIn={Boolean(session?.user?.id)} />
        <section aria-labelledby="comments-heading" className="mt-9">
          <h2 id="comments-heading" className="text-xl font-black uppercase">Comentarios ({comments.length})</h2>
          <p className="mt-2 text-xs text-zinc-500">Solo se muestran comentarios aprobados. Se cargan hasta 80 por conversación.</p>
          {comments.length ? <div className="mt-6 space-y-3">
            {comments.map(comment => <article key={comment.id} className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link href={"/members/" + encodeURIComponent(comment.author.username)}
                  className="text-sm font-bold text-orange-400">@{comment.author.username}</Link>
                <span className="text-xs text-zinc-500">{comment.createdAt.toLocaleDateString("es-ES", { timeZone: "Atlantic/Canary", dateStyle: "medium" })}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-300">{comment.content}</p>
            </article>)}
          </div> : <p className="mt-6 rounded-2xl border border-white/10 p-6 text-sm text-zinc-500">Todavía no hay comentarios aprobados.</p>}
        </section>
        <div className="mt-8">
          {session?.user?.id ? <CommentForm postId={post.id} /> :
            <p className="rounded-2xl border border-orange-500/20 p-6 text-sm text-zinc-400">
              <Link href={"/login?next=" + encodeURIComponent("/community/" + id)}
                className="font-bold text-orange-400 underline">Inicia sesión</Link>{" "}
              para participar en la conversación.
            </p>}
        </div>
      </div>
    </main>
  );
}
