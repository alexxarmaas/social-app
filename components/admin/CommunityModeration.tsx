"use client";
import Link from "next/link";
import { useState } from "react";

type PendingPost = { id: string; content: string; createdAt: string; imageUrl: string | null; author: { username: string } };
type Report = { id: string; reason: string; createdAt: string; post: { id: string; content: string; status: string; author: { username: string } } };

export default function CommunityModeration({ initialPending, initialReports }: { initialPending: PendingPost[]; initialReports: Report[] }) {
  const [pending, setPending] = useState(initialPending);
  const [reports, setReports] = useState(initialReports);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  async function moderate(id: string, status: "published" | "hidden") {
    setBusy(id); setMessage("");
    try {
      const response = await fetch("/api/admin/community/posts/" + id, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data: { ok?: boolean; error?: string } = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "No se pudo actualizar.");
      setPending((items) => items.filter((post) => post.id !== id));
      setReports((items) => items.map((report) => report.post.id === id ? { ...report, post: { ...report.post, status } } : report));
      setMessage(status === "published" ? "Publicacion aprobada." : "Publicacion ocultada.");
    } catch (failure) { setMessage(failure instanceof Error ? failure.message : "Error inesperado."); }
    finally { setBusy(""); }
  }

  return <div className="space-y-10">
    {message ? <p role="status" className="rounded-xl border border-orange-500/20 p-4 text-sm text-orange-400">{message}</p> : null}
    <section>
      <h2 className="text-2xl font-black uppercase">Pendientes ({pending.length})</h2>
      <p className="mt-3 text-sm text-zinc-400">Cada publicacion nueva requiere aprobacion antes de mostrarse.</p>
      <div className="mt-6 space-y-4">
        {pending.map((post) => <article key={post.id} className="rounded-2xl border border-white/10 p-6">
          <p className="text-xs uppercase tracking-wider text-orange-400">@{post.author.username}</p>
          <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-300">{post.content}</p>
          {post.imageUrl ? <p className="mt-3 text-xs text-zinc-500">Incluye fotografia — <a className="text-orange-400 underline" href={post.imageUrl} rel="noopener noreferrer" target="_blank">Revisar imagen ↗</a></p> : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button disabled={Boolean(busy)} onClick={() => moderate(post.id, "published")} className="rounded-xl bg-orange-500 px-5 py-3 text-xs font-black uppercase text-black">Aprobar</button>
            <button disabled={Boolean(busy)} onClick={() => moderate(post.id, "hidden")} className="rounded-xl border border-red-500/40 px-5 py-3 text-xs font-bold uppercase text-red-300">Rechazar</button>
          </div>
        </article>)}
        {!pending.length ? <p className="rounded-2xl border border-white/10 p-7 text-sm text-zinc-500">No hay publicaciones pendientes.</p> : null}
      </div>
    </section>
    <section>
      <h2 className="text-2xl font-black uppercase">Denuncias recientes ({reports.length})</h2>
      <div className="mt-6 space-y-4">
        {reports.map((report) => <article key={report.id} className="rounded-2xl border border-white/10 p-6">
          <p className="text-xs uppercase tracking-wider text-orange-400">{report.reason} · @{report.post.author.username} · {report.post.status}</p>
          <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm text-zinc-400">{report.post.content}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button disabled={Boolean(busy)} onClick={() => moderate(report.post.id, "hidden")} className="rounded-xl border border-red-500/40 px-4 py-2 text-xs font-bold uppercase text-red-300">Ocultar</button>
            <button disabled={Boolean(busy)} onClick={() => moderate(report.post.id, "published")} className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold uppercase">Mantener visible</button>
            <Link href={"/members/" + report.post.author.username} className="rounded-xl border border-white/10 px-4 py-2 text-xs text-zinc-400">Ver perfil ↗</Link>
          </div>
        </article>)}
        {!reports.length ? <p className="rounded-2xl border border-white/10 p-7 text-sm text-zinc-500">No hay denuncias.</p> : null}
      </div>
    </section>
  </div>;
}
