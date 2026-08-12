"use client";

import { useEffect, useState } from "react";

type Tester = {
  id: string;
  email: string;
  name: string | null;
  username: string;
  createdAt: string;
};

export default function RecceMindUserManager() {
  const [users, setUsers] = useState<Tester[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    const response = await fetch("/api/reccemind-users", { cache: "no-store" });
    if (!response.ok) return;
    const payload = (await response.json()) as { users: Tester[] };
    setUsers(payload.users);
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const createUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/reccemind-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "No se pudo crear la cuenta.");
        return;
      }

      setMessage(`Cuenta creada. ${email.trim().toLowerCase()} ya puede entrar en RecceMind.`);
      setName("");
      setEmail("");
      setPassword("");
      await loadUsers();
    } catch {
      setError("No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(20rem,0.75fr)_minmax(0,1.25fr)]">
      <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5 sm:p-6">
        <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Acceso de pruebas</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Crear tester</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">Esta cuenta solo tendrá acceso a RecceMind. No podrá entrar en el panel de administración de Tramassso.</p>

        <form onSubmit={createUser} className="mt-6 space-y-4">
          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">Nombre</span>
            <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder="Nombre del piloto" className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none focus:border-zinc-500" />
          </label>
          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">Correo</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="piloto@correo.com" className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none focus:border-zinc-500" />
          </label>
          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">Contraseña temporal</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={10} maxLength={128} placeholder="Mínimo 10 caracteres" className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none focus:border-zinc-500" />
          </label>

          {error ? <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
          {message ? <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{message}</p> : null}

          <button disabled={loading} type="submit" className="w-full rounded-2xl bg-white px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-zinc-200 disabled:opacity-50">
            {loading ? "Creando..." : "Crear acceso"}
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Usuarios RecceMind</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Testers activos</h2>
          </div>
          <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">{users.length}</span>
        </div>

        <div className="mt-5 divide-y divide-zinc-900 overflow-hidden rounded-2xl border border-zinc-800">
          {users.length ? users.map((user) => (
            <div key={user.id} className="flex flex-col gap-2 bg-black/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{user.name || user.email}</p>
                <p className="truncate text-sm text-zinc-500">{user.email}</p>
              </div>
              <p className="shrink-0 text-xs text-zinc-600">{new Date(user.createdAt).toLocaleDateString("es-ES")}</p>
            </div>
          )) : (
            <p className="px-4 py-8 text-center text-sm text-zinc-600">Aún no hay testers creados.</p>
          )}
        </div>
      </section>
    </div>
  );
}
