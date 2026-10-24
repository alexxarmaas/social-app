"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { safeInternalPath } from "@/app/lib/safe-redirect";

export default function CommunityAuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const register = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (register) {
        const response = await fetch("/api/community/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, username, email, password, consent, website }),
        });
        const result: { error?: string; message?: string } = await response.json();
        if (!response.ok) {
          setError(result.error || "No se pudo crear tu cuenta.");
          return;
        }
        setNotice(result.message || "Revisa tu correo y confirma tu cuenta.");
        setPassword("");
        return;
      }
      const response = await signIn("credentials", { redirect: false, email, password });
      if (response?.error) {
        setError(register ? "Cuenta creada. Inicia sesion para continuar." : "Correo o clave incorrectos.");
        return;
      }
      const next = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
      router.push(safeInternalPath(next, "/garage/mine"));
      router.refresh();
    } catch {
      setError("No hemos podido conectar. Intentalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-[75vh] bg-zinc-950 px-4 py-16 text-white">
      <div className="mx-auto max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">Tramassso / Comunidad</p>
        <h1 className="mt-5 text-4xl font-black uppercase tracking-wider">{register ? "Entra al club." : "Bienvenido de vuelta."}</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400">
          {register ? "Crea tu perfil gratis y empieza a construir tu garaje digital." : "Accede a tu garaje y sigue preparando tu proximo proyecto."}
        </p>
        <form className="mt-9 space-y-5 rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8" onSubmit={submit}>
          {register ? (
            <>
              <label className="block text-xs font-medium uppercase tracking-widest text-zinc-300">
                Tu nombre
                <input required minLength={2} maxLength={70} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-zinc-950 px-4 py-3 text-base normal-case tracking-normal text-white outline-none focus:border-orange-500" />
              </label>
              <label className="block text-xs font-medium uppercase tracking-widest text-zinc-300">
                Nombre de usuario
                <input required pattern="[a-zA-Z0-9_]{3,24}" minLength={3} maxLength={24} autoComplete="username"
                  value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} placeholder="tu_alias"
                  className="mt-2 w-full rounded-xl border border-white/15 bg-zinc-950 px-4 py-3 text-base normal-case tracking-normal text-white outline-none placeholder:text-zinc-600 focus:border-orange-500" />
              </label>
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
              </div>
            </>
          ) : null}
          <label className="block text-xs font-medium uppercase tracking-widest text-zinc-300">
            Email
            <input type="email" autoComplete="email" required maxLength={160} value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-zinc-950 px-4 py-3 text-base normal-case tracking-normal text-white outline-none focus:border-orange-500" />
          </label>
          <label className="block text-xs font-medium uppercase tracking-widest text-zinc-300">
            Contraseña
            <input type="password" autoComplete={register ? "new-password" : "current-password"} minLength={register ? 12 : undefined} maxLength={128} required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-zinc-950 px-4 py-3 text-base normal-case tracking-normal text-white outline-none focus:border-orange-500" />
            {register ? <span className="mt-2 block text-[11px] normal-case tracking-normal text-zinc-500">Minimo 12 caracteres. No reutilices una contraseña antigua.</span> : null}
          </label>
          {register ? (
            <label className="flex items-start gap-3 text-xs leading-6 text-zinc-400">
              <input type="checkbox" className="mt-1 accent-orange-500" required checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>He leido la <Link href="/privacidad" className="underline text-white">politica de privacidad</Link>. Entiendo que mi alias y los coches que publique seran visibles para todos.</span>
            </label>
          ) : null}
          {notice ? <p role="status" className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-200">{notice} <Link href="/verify-email" className="underline">Solicitar nuevo enlace</Link></p> : null}
          {error ? <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}
          <button type="submit" disabled={busy} className="w-full rounded-xl bg-orange-500 px-5 py-3.5 text-xs font-black uppercase tracking-[0.22em] text-black transition hover:bg-orange-400 disabled:opacity-60">
            {busy ? "Procesando..." : register ? "Crear cuenta gratis" : "Entrar a mi garaje"}
          </button>
        </form>
        {!register ? <div className="mt-5 flex flex-wrap justify-center gap-5 text-sm"><Link className="text-orange-400 underline" href="/forgot-password">Olvide mi contraseña</Link><Link className="text-zinc-400 underline" href="/verify-email">Verificar mi correo</Link></div> : null}
        <p className="mt-6 text-center text-sm text-zinc-400">
          {register ? "¿Ya tienes cuenta?" : "¿Aun no formas parte?"}{" "}
          <Link href={register ? "/login" : "/register"} className="font-semibold text-orange-500 underline">
            {register ? "Inicia sesion" : "Unete gratis"}
          </Link>
        </p>
      </div>
    </main>
  );
}
