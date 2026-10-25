import type { Metadata } from "next";
import Link from "next/link";
import CommunityAuthForm from "@/components/community/CommunityAuthForm";
import { communityRegistrationReady } from "@/app/lib/community-security";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Únete a Tramassso",
  description: "Descubre Tramassso, el Garage gratuito, los eventos y las personas que comparten tu pasión por el motor.",
};

export default function RegisterPage() {
  if (communityRegistrationReady()) return <CommunityAuthForm mode="register" />;

  return (
    <main className="min-h-[75vh] bg-zinc-950 px-4 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-400">Tramassso / Comunidad</p>
        <h1 className="mt-5 text-5xl font-black uppercase tracking-wide sm:text-6xl">
          Estamos preparando la salida.
        </h1>
        <p className="mt-7 max-w-2xl text-base leading-8 text-zinc-400">
          Las nuevas cuentas están temporalmente cerradas mientras terminamos de verificar el sistema.
          Los eventos, las rutas y los coches públicos se pueden explorar sin registrarse.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/events" className="rounded-xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-wider text-black">
            Ver eventos ↗
          </Link>
          <Link href="/garage" className="rounded-xl border border-white/20 px-6 py-4 text-xs font-bold uppercase tracking-wider">
            Explorar Garage
          </Link>
          <Link href="/members" className="rounded-xl border border-white/20 px-6 py-4 text-xs font-bold uppercase tracking-wider">
            Conocer miembros
          </Link>
        </div>
        <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-7">
          <h2 className="text-xl font-black uppercase">¿Ya tenías cuenta?</h2>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            El acceso de miembros existentes no depende de que estén abiertas las nuevas inscripciones.
          </p>
          <Link href="/login" className="mt-5 inline-flex text-sm font-bold text-orange-400 underline">
            Iniciar sesión →
          </Link>
        </div>
        <p className="mt-8 text-sm text-zinc-500">
          Las novedades del lanzamiento también se publican en{" "}
          <a href="https://www.instagram.com/tramassso_/" target="_blank" rel="noopener noreferrer"
            className="text-orange-400 underline">Instagram de Tramassso</a>.
        </p>
      </div>
    </main>
  );
}
