"use client";
import Image from "next/image";
import Link from "next/link";
import TramasssoIcon from "@/components/ui/TramasssoIcon";
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

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-[#111214]">
      <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden="true" className="trm-icon-frame h-11 w-11 rounded-full font-sans text-lg font-black">
            {post.author.username.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <Link href={"/members/" + encodeURIComponent(post.author.username)}
              className="block truncate text-sm font-bold text-white hover:text-orange-400">
              @{post.author.username}
            </Link>
            <p className="mt-1 text-xs text-zinc-500">
              {new Date(post.createdAt).toLocaleDateString("es-ES", {
                timeZone: "Atlantic/Canary", day: "numeric", month: "short", year: "numeric",
              })}
            </p>
          </div>
        </div>
        <span className="trm-pill shrink-0 border-white/10 bg-white/[0.025] text-zinc-500">Comunidad</span>
      </div>
      <p className="whitespace-pre-wrap break-words px-5 pb-6 text-sm leading-7 text-zinc-200 sm:px-6">{post.content}</p>
      {image ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-black">
          <Image src={image} alt={"Fotografía compartida por @" + post.author.username} fill
            sizes="(max-width: 768px) 100vw, 700px" className="object-cover" />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4 sm:px-6">
        {signedIn ? (
          <button type="button" disabled={busy} onClick={toggleLike} aria-pressed={liked}
            className={"inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors " +
              (liked ? "border-orange-500/50 bg-orange-500/10 text-orange-300" : "border-white/15 text-zinc-300 hover:border-orange-500/50 hover:text-orange-300")}>
            <TramasssoIcon name="heart" size="sm" frame={false} className={liked ? "text-orange-400" : ""} />
            {likes} {likes === 1 ? "me gusta" : "me gusta"}
          </button>
        ) : (
          <Link href={"/login?next=" + encodeURIComponent("/community/" + post.id)}
            className="inline-flex items-center gap-2 text-xs text-orange-400 hover:underline">
            <TramasssoIcon name="heart" frame={false} size="sm" /> {likes} me gusta
          </Link>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <Link href={"/community/" + post.id}
            className="inline-flex items-center gap-2 text-xs font-bold text-orange-400 hover:text-orange-300">
            <TramasssoIcon name="community" frame={false} size="sm" /> Conversación
            <TramasssoIcon name="arrow" frame={false} size="sm" />
          </Link>
          {signedIn ? (
            <button type="button" onClick={() => setReporting(!reporting)}
              aria-expanded={reporting}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-300">
              <TramasssoIcon name="clubs" frame={false} size="sm" /> Denunciar
            </button>
          ) : null}
        </div>
      </div>
      {reporting ? (
        <div className="flex flex-wrap items-center gap-3 border-t border-white/10 bg-black/20 p-5">
          <select aria-label="Motivo de denuncia" value={reportReason} onChange={(e) => setReportReason(e.target.value)}
            className="min-h-11 rounded-xl border border-white/15 bg-black px-4 py-3 text-xs text-white">
            <option value="spam">Spam</option>
            <option value="abuso">Acoso o insultos</option>
            <option value="contenido_inapropiado">Contenido inapropiado</option>
            <option value="privacidad">Privacidad</option>
            <option value="otros">Otro motivo</option>
          </select>
          <button type="button" disabled={busy} onClick={report} className="trm-action">
            Enviar denuncia
          </button>
        </div>
      ) : null}
      {notice ? <p role="status" className="border-t border-white/10 px-5 py-3 text-xs text-zinc-300">{notice}</p> : null}
    </article>
  );
}
