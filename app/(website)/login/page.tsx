"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [nextPath, setNextPath] = useState<string>('/admin');

    // Lee `next` en cliente para evitar el bailout CSR durante el prerender.
    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const next = params.get('next');
            if (next) setNextPath(next);
        } catch {
            // ignore
        }
    }, []);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Credenciales inválidas");
            } else {
                router.push(nextPath);
            }
        } catch {
            setError("Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
            {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                        Tramassso
                    </Link>
                    <p className="text-slate-400 mt-2">Acceso privado para el equipo de Tramassso</p>
                </div>

                {/* Formulario de acceso */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
                    <h2 className="text-2xl font-bold text-white mb-6">Iniciar sesión</h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-slate-300 text-sm font-semibold mb-2">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-700/50 text-white placeholder-slate-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 border border-slate-600"
                                placeholder="tu@correo.com"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-300 text-sm font-semibold mb-2">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-700/50 text-white placeholder-slate-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 border border-slate-600"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="text-sm">
                            <label className="flex items-center text-slate-400">
                                <input type="checkbox" className="mr-2" />
                                Recuérdame
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50"
                        >
                            {loading ? "Iniciando..." : "Iniciar sesión"}
                        </button>
                    </form>

                    <p className="text-center text-slate-400 mt-6">Si necesitas acceso administrativo, usa credenciales autorizadas.</p>
                </div>

                {/* Volver al inicio */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                        ← Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}
