"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { safeInternalPath } from "@/app/lib/safe-redirect";

export default function AdminLoginForm() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");
      setNextPath(safeInternalPath(next));
    } catch {
      // Sin accion: el fallback es /admin.
    }
  }, []);

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
        setError("Credenciales invalidas.");
      } else {
        router.push(safeInternalPath(nextPath));
        router.refresh();
      }
    } catch {
      setError("No se pudo iniciar sesion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-5 py-16 text-zinc-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="font-aeroblade text-4xl font-bold tracking-[0.16em] text-white">
            Tramassso
          </Link>
          <p className="mt-3 text-sm text-zinc-500">Acceso privado para el equipo de Tramassso</p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
          <h1 className="mb-6 text-2xl font-semibold text-white">Iniciar sesion</h1>

          {error ? (
            <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Correo electronico</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30"
                placeholder="tu@correo.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-zinc-500">Clave</span>
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
              {loading ? "Iniciando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
