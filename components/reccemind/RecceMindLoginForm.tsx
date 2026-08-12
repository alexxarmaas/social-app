"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RecceMindLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (response?.error) {
        setError("Correo o contraseña incorrectos.");
        return;
      }

      const access = await fetch("/api/reccemind-access", { cache: "no-store" });
      if (!access.ok) {
        setError("Esta cuenta no tiene acceso a RecceMind.");
        return;
      }

      router.push("/reccemind");
      router.refresh();
    } catch {
      setError("No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-5 py-16 text-zinc-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.45em] text-rose-300/70">Tramassso Labs</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">RecceMind</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">Acceso privado para pilotos y testers autorizados.</p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
          <h2 className="mb-6 text-2xl font-semibold text-white">Entrar a RecceMind</h2>

          {error ? (
            <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Correo electrónico</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30"
                placeholder="piloto@correo.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Comprobando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs leading-5 text-zinc-600">Las cuentas de prueba son creadas por el equipo de RecceMind.</p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-zinc-600 transition hover:text-zinc-300">Volver a Tramassso</Link>
        </div>
      </div>
    </main>
  );
}
