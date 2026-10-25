import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { socialEnabled } from "@/app/lib/community-social";
import MarkNotificationsRead from "@/components/community/MarkNotificationsRead";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mis notificaciones", robots: { index: false, follow: false } };

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=%2Fnotifications");
  const enabled = socialEnabled();
  const notifications = enabled ? await prisma.notification.findMany({
    where: { userId: session.user.id },
    take: 50, orderBy: { createdAt: "desc" },
    select: {
      id: true, type: true, message: true, read: true, createdAt: true, postId: true,
      actor: { select: { username: true } },
    },
  }) : [];
  const unread = notifications.filter(n => !n.read).length;
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-14 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-400">Mi Tramassso / Actividad</p>
        <h1 className="mt-5 text-4xl font-black uppercase">Notificaciones</h1>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-zinc-400">{enabled ? unread + " sin leer" : "El módulo de comunidad aún está en preparación."}</p>
          {enabled ? <MarkNotificationsRead count={unread} /> : null}
        </div>

        <div className="mt-8 space-y-3">
          {notifications.map((item) => (
            <article key={item.id} className={"rounded-2xl border p-5 sm:p-6 " +
              (item.read ? "border-white/10 bg-zinc-900/30" : "border-orange-500/30 bg-orange-500/[0.06]")}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-400">
                {item.type === "FOLLOW" ? "Nuevo seguidor" : item.type === "LIKE" ? "Me gusta" : "Actividad"}
                {!item.read ? " · Nuevo" : ""}
              </p>
              <p className="mt-3 text-sm leading-7 text-zinc-300">
                <Link href={"/members/" + encodeURIComponent(item.actor.username)}
                  className="font-bold text-white underline">@{item.actor.username}</Link>{" "}
                {item.message}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                <span>{item.createdAt.toLocaleString("es-ES", { timeZone: "Atlantic/Canary", dateStyle: "medium", timeStyle: "short" })}</span>
                {item.postId ? <Link href="/community" className="text-orange-400 underline">Ver comunidad ↗</Link> : null}
              </div>
            </article>
          ))}
          {enabled && !notifications.length ? <div className="rounded-2xl border border-white/10 p-9 text-center">
            <p className="font-semibold">Todavía no tienes notificaciones.</p>
            <p className="mt-3 text-sm text-zinc-400">Sigue compartiendo coches y conectando con otros miembros.</p>
            <Link href="/members" className="mt-6 inline-flex text-sm text-orange-400 underline">Descubrir miembros ↗</Link>
          </div> : null}
        </div>
        <Link href="/mi-tramassso" className="mt-8 inline-flex text-sm text-orange-400 underline">Volver a mi espacio ↗</Link>
      </div>
    </main>
  );
}
