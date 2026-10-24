"use client";
import { useState } from "react";
import Link from "next/link";

export default function FollowButton({ username, initialFollowing, signedIn, isSelf }: {
  username: string; initialFollowing: boolean; signedIn: boolean; isSelf: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (isSelf) return <Link href="/account" className="rounded-xl border border-orange-500/50 px-5 py-3 text-xs font-bold uppercase text-orange-400">Editar perfil</Link>;
  if (!signedIn) return <Link href={"/login?next=" + encodeURIComponent("/members/" + username)} className="rounded-xl bg-orange-500 px-5 py-3 text-xs font-black uppercase text-black">Entra para seguir</Link>;
  async function toggle() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/community/follow/" + encodeURIComponent(username), { method: following ? "DELETE" : "POST" });
      const result: { following?: boolean; error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo actualizar.");
      setFollowing(Boolean(result.following));
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Error de conexion."); }
    finally { setBusy(false); }
  }
  return <div>
    <button type="button" disabled={busy} onClick={toggle} className={"rounded-xl px-5 py-3 text-xs font-black uppercase tracking-wider disabled:opacity-50 " +
      (following ? "border border-white/20 text-white" : "bg-orange-500 text-black")}>{busy ? "Actualizando..." : following ? "Siguiendo ✓" : "Seguir usuario"}</button>
    {error ? <p role="alert" className="mt-2 text-xs text-red-300">{error}</p> : null}
  </div>;
}
