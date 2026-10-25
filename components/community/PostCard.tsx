"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { safeCarImage } from "@/app/lib/community";

export type CommunityPost = {
  id: string; content: string; imageUrl: string | null; createdAt: string;
  author: { username: string; name: string | null };
  likes: number; liked: boolean;
};

export default function PostCard({ post, signedIn }: { post: CommunityPost; signedIn: boolean }) {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [busy, setBusy] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [notice, setNotice] = useState("");
  const image = safeCarImage(post.imageUrl);

  async function toggleLike() {
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/community/posts/" + post.id + "/like", { method: liked ? "DELETE" : "POST" });
      const result: { liked?: boolean; error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo guardar.");
      if (result.liked !== liked) setLikes((count) => count + (result.liked ? 1 : -1));
      setLiked(Boolean(result.liked));
    } catch (failure) { setNotice(failure instanceof Error ? failure.message : "Error de conexion."); }
    finally { setBusy(false); }
  }

  async function report() {
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/community/posts/" + post.id + "/report", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason }),
      });
      const result: { error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo enviar.");
      setReporting(false); setNotice("Gracias. Revisaremos la publicacion.");
    } catch (failure) { setNotice(failure instanceof Error ? failure.message : "Error al denunciar."); }
    finally { setBusy(false); }
  }

  return <article className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50">
    <div className="flex items-center justify-between gap-3 p-5">
      <div>
        <Link href={"/members/" + encodeURIComponent(post.author.username)} className="font-bold text-white hover:text-orange-400">@{post.author.username}</Link>
        <p className="mt-1 text-xs text-zinc-500">{new Date(post.createdAt).toLocaleDateString("es-ES", { timeZone: "Atlantic/Canary", day: "numeric", month: "short", year: "numeric" })}</p>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Tramassso / Feed</span>
    </div>
    <p className="whitespace-pre-wrap break-words px-5 pb-5 text-sm leading-7 text-zinc-300">{post.content}</p>
    {image ? <div className="relative aspect-[16/10] bg-black"><Image src={image} alt={"Fotografia compartida por @" + post.author.username} fill sizes="(max-width: 768px) 100vw, 700px" className="object-cover" /></div> : null}
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-xs">
      {signedIn ? <button type="button" disabled={busy} onClick={toggleLike} aria-pressed={liked}
        className={"rounded-xl border px-4 py-2.5 font-bold uppercase tracking-wider " + (liked ? "border-orange-500/60 bg-orange-500/10 text-orange-400" : "border-white/15 text-zinc-300")}>{liked ? "♥" : "♡"} {likes} me gusta</button> :
        <Link href="/login?next=%2Fcommunity" className="text-orange-400 underline">Entra para dar me gusta · {likes}</Link>}
      <div className="flex flex-wrap items-center gap-4">
        <Link href={"/community/" + post.id} className="font-semibold text-orange-400 underline">Ver conversación ↗</Link>
        {signedIn ? <button type="button" onClick={() => setReporting(!reporting)} className="text-zinc-500 hover:text-orange-400">Denunciar</button> : null}
      </div>
    </div>
    {reporting ? <div className="flex flex-wrap items-center gap-3 border-t border-white/10 p-5">
      <select aria-label="Motivo de denuncia" value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="rounded-xl border border-white/15 bg-black px-4 py-3 text-xs text-white">
        <option value="spam">Spam</option><option value="abuso">Acoso o insultos</option>
        <option value="contenido_inapropiado">Contenido inapropiado</option><option value="privacidad">Privacidad</option><option value="otros">Otro motivo</option>
      </select>
      <button type="button" disabled={busy} onClick={report} className="rounded-xl bg-orange-500 px-4 py-3 text-xs font-bold text-black">Enviar denuncia</button>
    </div> : null}
    {notice ? <p role="status" className="border-t border-white/10 px-5 py-3 text-xs text-zinc-300">{notice}</p> : null}
  </article>;
}
