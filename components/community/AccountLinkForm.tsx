"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
export default function AccountLinkForm({ kind, token }: { kind: "verify" | "reset"; token?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage(""); setError("");
    try {
      const response = await fetch(token ? "/api/community/account-token" : "/api/community/account-link", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(token ? { kind, token, ...(kind === "reset" ? { password } : {}) } : { kind, email }),
      });
      const data: { error?: string; message?: string; ok?: boolean } = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "No se pudo completar.");
      setMessage(data.message || (kind === "verify" ? "Correo verificado. Ya puedes iniciar sesion." : "Contraseña actualizada. Ya puedes iniciar sesion."));
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Error de conexion."); }
    finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="mt-9 max-w-md space-y-6 rounded-3xl border border-white/10 bg-zinc-900/50 p-7">
      {!token ? <label className="block text-xs uppercase tracking-wider text-zinc-300">Correo de la cuenta
        <input required type="email" maxLength={160} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-base text-white focus:border-orange-500" />
      </label> : null}
      {token && kind === "reset" ? <label className="block text-xs uppercase tracking-wider text-zinc-300">Nueva contraseña
        <input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-base text-white focus:border-orange-500" />
        <span className="mt-2 block text-xs normal-case text-zinc-500">Minimo 12 caracteres.</span>
      </label> : null}
      {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
      {message ? <p role="status" className="text-sm text-orange-300">{message} <Link href="/login" className="underline">Entrar</Link></p> : null}
      <button disabled={busy} className="rounded-xl bg-orange-500 px-5 py-3 text-xs font-bold uppercase tracking-wider text-black disabled:opacity-50">
        {busy ? "Procesando..." : token ? (kind === "verify" ? "Verificar correo" : "Cambiar contraseña") : (kind === "verify" ? "Enviar enlace de verificacion" : "Solicitar enlace de recuperacion")}
      </button>
    </form>
  );
}
