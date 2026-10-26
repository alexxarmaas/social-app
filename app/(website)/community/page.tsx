import type { Metadata } from "next";
import Link from "next/link";
import TramasssoIcon from "@/components/ui/TramasssoIcon";
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

export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const filters = await searchParams;
  const enabled = socialEnabled();
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id || null;
  const followingTab = filters.tab === "siguiendo" && Boolean(viewerId);
  let posts: CommunityPost[] = [];
  if (enabled) {
    try {
      const results = await prisma.post.findMany({
        where: {
          status: "published",
          ...(followingTab && viewerId ? {
            author: { followers: { some: { followerId: viewerId } } },
          } : {}),
        },
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
    <main className="min-h-screen bg-[#08090a] px-4 pb-20 pt-12 text-white sm:pt-16">
      <div className="mx-auto max-w-6xl">
        <span className="trm-pill"><TramasssoIcon name="community" frame={false} size="sm" /> Tramassso / Comunidad</span>
        <h1 className="mt-5 font-sans text-[clamp(2.8rem,5.7vw,4.8rem)] font-black uppercase leading-[1.04] tracking-[-0.05em]">Gente de motor.</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
          Avances, proyectos y conversaciones de verdad. Comparte tu historia y descubre la de los demás.
        </p>
        {enabled ? (
          <nav aria-label="Filtrar publicaciones" className="mt-9 flex flex-wrap gap-3">
            <Link href="/community" aria-current={!followingTab ? "page" : undefined}
              className={!followingTab ? "trm-action" : "trm-action-secondary"}>
              <TramasssoIcon name="activity" frame={false} size="sm" /> Recientes
            </Link>
            <Link href={viewerId ? "/community?tab=siguiendo" : "/login?next=%2Fcommunity%3Ftab%3Dsiguiendo"}
              aria-current={followingTab ? "page" : undefined}
              className={followingTab ? "trm-action" : "trm-action-secondary"}>
              <TramasssoIcon name="members" frame={false} size="sm" /> Siguiendo
            </Link>
            <Link href="/members" className="trm-action-secondary">
              <TramasssoIcon name="search" frame={false} size="sm" /> Buscar miembros
            </Link>
          </nav>
        ) : null}
        <div className="mt-8 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(270px,0.43fr)]">
          <div className="min-w-0 space-y-5">
            {!enabled ? (
              <div className="trm-surface p-8">
                <TramasssoIcon name="community" size="lg" />
                <h2 className="mt-5 font-sans text-2xl font-black uppercase tracking-tight">Comunidad en preparación.</h2>
                <p className="mt-4 text-sm leading-7 text-zinc-400">Estamos completando la moderación. Mientras tanto, explora los garajes y clubes.</p>
                <Link href="/garage" className="trm-action mt-6">Ir a Garage <TramasssoIcon name="arrow" frame={false} size="sm" /></Link>
              </div>
            ) : (
              <>
                {session?.user?.id ? <PostComposer /> : (
                  <div className="trm-surface p-6">
                    <div className="flex items-center gap-3">
                      <TramasssoIcon name="community" size="md" />
                      <h2 className="font-sans text-lg font-black uppercase">¿Tienes algo que contar?</h2>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-zinc-400">Únete gratis para publicar, seguir proyectos y dar me gusta.</p>
                    <Link href="/register" className="trm-action mt-6">
                      Crear cuenta <TramasssoIcon name="arrow" frame={false} size="sm" />
                    </Link>
                  </div>
                )}
                {posts.map((post) => <PostCard key={post.id} post={post} signedIn={Boolean(session?.user?.id)} />)}
                {!posts.length ? (
                  <div className="trm-surface p-8 text-center">
                    <TramasssoIcon name="community" size="lg" />
                    <p className="mt-5 text-sm leading-7 text-zinc-400">
                      {followingTab ? "Aún no hay publicaciones de las personas a las que sigues." :
                        "Todavía no hay publicaciones aprobadas. El contenido pasa por moderación."}
                    </p>
                    {followingTab ? (
                      <Link href="/members" className="mt-5 inline-flex items-center gap-2 text-sm text-orange-400">
                        Descubrir miembros <TramasssoIcon name="arrow" frame={false} size="sm" />
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
          </div>
          <aside className="trm-surface p-6 lg:sticky lg:top-28">
            <TramasssoIcon name="members" size="lg" />
            <p className="trm-kicker mt-6">Un mismo motor</p>
            <h2 className="mt-3 font-sans text-xl font-black uppercase tracking-tight">Tu coche, tu comunidad.</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Una ficha para tus coches y un espacio permanente para tus proyectos, más allá de las historias que desaparecen.
            </p>
            <div className="mt-6 grid gap-2">
              {([
                { href: "/garage", label: "Explorar Garage", icon: "garage" as const },
                { href: "/clubs", label: "Descubrir clubes", icon: "clubs" as const },
                { href: "/events", label: "Próximos eventos", icon: "events" as const },
              ]).map((item) => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-orange-500/40 hover:text-white">
                  <TramasssoIcon name={item.icon} frame={false} size="sm" className="text-orange-400" />
                  <span className="flex-1">{item.label}</span>
                  <TramasssoIcon name="arrow" frame={false} size="sm" />
                </Link>
              ))}
            </div>
            <p className="mt-6 border-t border-white/10 pt-5 text-xs leading-6 text-zinc-500">
              Comparte con respeto. Evita matrículas visibles, información personal e imágenes de terceros sin permiso.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
