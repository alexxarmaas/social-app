import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { socialEnabled } from "@/app/lib/community-social";
import PostComposer from "@/components/community/PostComposer";
import PostCard, { type CommunityPost } from "@/components/community/PostCard";
import { buildPremiumMetadata } from "@/app/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPremiumMetadata({
  title: "La comunidad Tramassso",
  description: "Proyectos, preparaciones y conversaciones entre aficionados al motor. Sigue a otros conductores y comparte tu historia.",
  path: "/community",
});

export default async function CommunityPage() {
  const enabled = socialEnabled();
  const session = await getServerSession(authOptions);
  let posts: CommunityPost[] = [];
  if (enabled) {
    try {
      const results = await prisma.post.findMany({
        where: { status: "published" },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: {
          id: true, content: true, imageUrl: true, createdAt: true,
          author: { select: { username: true, name: true } },
          _count: { select: { likes: true } },
          likes: { where: { userId: session?.user?.id || "__visitor__" }, select: { id: true } },
        },
      });
      posts = results.map((item) => ({
        id: item.id, content: item.content, imageUrl: item.imageUrl,
        createdAt: item.createdAt.toISOString(), author: item.author,
        likes: item._count.likes, liked: item.likes.length > 0,
      }));
    } catch (error) {
      console.error("Community feed unavailable", error);
    }
  }
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12 text-white sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-400">Tramassso / Comunidad</p>
        <h1 className="mt-5 text-5xl font-black uppercase tracking-wide sm:text-7xl">Gente de motor.</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400">Aquí se comparten los proyectos de verdad: tus avances, tus experiencias y las historias detrás de los coches.</p>
        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.4fr)]">
          <div className="space-y-6">
            {!enabled ? (
              <div className="rounded-3xl border border-orange-500/20 bg-orange-500/5 p-8">
                <h2 className="text-2xl font-black uppercase">Comunidad en preparación.</h2>
                <p className="mt-4 text-sm leading-7 text-zinc-400">Estamos completando las herramientas de moderación. Mientras tanto, puedes explorar los coches y clubes existentes.</p>
                <Link href="/garage" className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-xs font-bold uppercase text-black">Ir a Garage</Link>
              </div>
            ) : (
              <>
                {session?.user?.id ? <PostComposer /> : <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6">
                  <p className="font-bold">¿Quieres compartir tu proyecto?</p>
                  <p className="mt-3 text-sm text-zinc-400">Únete gratis para publicar, seguir a otros miembros y dar me gusta.</p>
                  <Link href="/register" className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-xs font-bold uppercase text-black">Crear cuenta</Link>
                </div>}
                {posts.map((post) => <PostCard key={post.id} post={post} signedIn={Boolean(session?.user?.id)} />)}
                {!posts.length ? <p className="rounded-3xl border border-white/10 p-8 text-center text-sm text-zinc-400">Todavía no hay publicaciones aprobadas. Las nuevas publicaciones se revisan antes de aparecer.</p> : null}
              </>
            )}
          </div>
          <aside className="rounded-3xl border border-white/10 bg-zinc-900/50 p-7">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">Un mismo motor</p>
            <h2 className="mt-4 text-xl font-black uppercase">Tu coche, tu comunidad.</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-400">El muro no sustituye Instagram. Aquí tus proyectos tienen una ficha permanente y un perfil que puedes compartir.</p>
            <div className="mt-7 grid gap-3 text-xs font-bold uppercase tracking-wider">
              <Link href="/garage" className="rounded-xl border border-white/15 px-4 py-3 hover:border-orange-500">Explorar Garage ↗</Link>
              <Link href="/clubs" className="rounded-xl border border-white/15 px-4 py-3 hover:border-orange-500">Descubrir clubes ↗</Link>
              <Link href="/events" className="rounded-xl border border-white/15 px-4 py-3 hover:border-orange-500">Próximos eventos ↗</Link>
            </div>
            <p className="mt-7 text-xs leading-6 text-zinc-500">Se moderan publicaciones y denuncias. Evita datos personales, matrículas visibles e imágenes de terceros sin autorización.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
