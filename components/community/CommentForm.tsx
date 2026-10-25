"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function CommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/community/posts/" + postId + "/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, website }),
      });
      const result: { ok?: boolean; error?: string } = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo enviar el comentario.");
      setMessage("Comentario enviado a revisión. Aparecerá al aprobarse.");
      setContent("");
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Error de conexión.");
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6">
      <label className="block text-sm font-bold text-zinc-300">Escribe un comentario
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          required rows={4} minLength={3} maxLength={600} placeholder="Comparte una idea, una pregunta o tu experiencia…"
          className="mt-3 w-full rounded-xl border border-white/15 bg-black/50 p-4 text-base font-normal text-white outline-none focus:border-orange-500" />
      </label>
      <label aria-hidden="true" className="absolute -left-[9999px]">Website
        <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </label>
      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="text-xs text-zinc-500">Los comentarios se revisan antes de publicarse · {content.length}/600</p>
        <button type="submit" disabled={busy} className="rounded-xl bg-orange-500 px-6 py-3 text-xs font-black uppercase text-black disabled:opacity-50">
          {busy ? "Enviando…" : "Enviar"}
        </button>
      </div>
      {error ? <p role="alert" className="mt-4 text-sm text-red-300">{error}</p> : null}
      {message ? <p role="status" className="mt-4 text-sm text-orange-300">{message}</p> : null}
    </form>
  );
}
