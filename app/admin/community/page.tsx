import { getCurrentAdminSession } from "@/app/lib/admin-auth";
import { prisma } from "@/app/lib/prisma";
import { socialEnabled } from "@/app/lib/community-social";
import CommunityModeration from "@/components/admin/CommunityModeration";

export const dynamic = "force-dynamic";

export default async function CommunityAdminPage() {
  const session = await getCurrentAdminSession();
  if (!session) return null;
  let pending: Array<{ id: string; content: string; createdAt: string; imageUrl: string | null; author: { username: string } }> = [];
  let reports: Array<{ id: string; reason: string; createdAt: string; post: { id: string; content: string; status: string; author: { username: string } } }> = [];
  let comments: Array<{ id: string; content: string; createdAt: string; author: { username: string }; post: { id: string } }> = [];
  const enabled = socialEnabled();
  if (enabled) {
    const [drafts, complaints, waitingComments] = await Promise.all([
      prisma.post.findMany({
        where: { status: "pending" },
        take: 100,
        orderBy: { createdAt: "asc" },
        select: { id: true, content: true, createdAt: true, imageUrl: true, author: { select: { username: true } } },
      }),
      prisma.postReport.findMany({
        orderBy: { createdAt: "desc" }, take: 100,
        select: { id: true, reason: true, createdAt: true,
          post: { select: { id: true, content: true, status: true, author: { select: { username: true } } } } },
      }),
      prisma.comment.findMany({
        where: { status: "pending" }, take: 100, orderBy: { createdAt: "asc" },
        select: {
          id: true, content: true, createdAt: true,
          author: { select: { username: true } }, post: { select: { id: true } },
        },
      }),
    ]);
    pending = drafts.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }));
    reports = complaints.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }));
    comments = waitingComments.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }));
  }
  return <main className="max-w-5xl space-y-8">
    <div><p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-400">Tramassso / Seguridad de comunidad</p>
      <h1 className="mt-4 text-4xl font-black uppercase">Moderacion</h1>
      <p className="mt-4 text-sm text-zinc-400">Gestiona las publicaciones antes de su aparicion y revisa el contenido denunciado.</p>
    </div>
    {enabled ? <CommunityModeration initialPending={pending} initialReports={reports} initialComments={comments} /> :
      <p className="rounded-2xl border border-orange-500/20 p-8 text-sm text-zinc-400">Modulo pendiente de activar: exige migracion de Prisma y COMMUNITY_SOCIAL_ENABLED.</p>}
  </main>;
}
