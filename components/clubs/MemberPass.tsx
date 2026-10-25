import Link from "next/link";

type Membership = {
  id: string;
  joinedAt: Date;
  club: { id: string; name: string; category: string; location: string | null };
};

/**
 * A visual membership pass backed by an approved ClubMember record.
 * This is not a check-in QR or proof of identity. The abbreviated
 * reference helps the member identify their card and is not used to authorize access.
 */
export default function MemberPass({ membership, username }: { membership: Membership; username: string }) {
  const reference = "TRM-" + membership.id.replaceAll("-", "").slice(0, 12).toUpperCase();
  return (
    <article className="relative overflow-hidden rounded-[1.6rem] border border-orange-500/35 bg-[radial-gradient(circle_at_100%_0%,rgba(255,106,0,0.18),transparent_50%),linear-gradient(125deg,#181818,#050505)] p-6 text-white shadow-xl sm:p-8">
      <div aria-hidden="true" className="absolute -right-8 top-9 rotate-[-16deg] text-7xl font-black tracking-widest text-white/[0.045]">TRM</div>
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <span className="font-aeroblade text-xl tracking-wider">Tramassso<span className="text-orange-500">.</span></span>
          <span className="rounded-full border border-orange-500/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-400">Miembro aprobado</span>
        </div>
        <p className="mt-10 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Carnet digital de club</p>
        <h3 className="mt-2 break-words text-2xl font-black uppercase tracking-wide">{membership.club.name}</h3>
        <p className="mt-3 text-sm text-zinc-300">@{username} · {membership.club.category}</p>
        <div className="mt-8 flex flex-wrap justify-between gap-5 border-t border-white/10 pt-5 text-xs">
          <div><p className="uppercase tracking-wider text-zinc-500">Referencia de socio</p><p className="mt-2 font-mono text-orange-400">{reference}</p></div>
          <div><p className="uppercase tracking-wider text-zinc-500">Desde</p><p className="mt-2 font-mono text-white">{membership.joinedAt.toLocaleDateString("es-ES", { timeZone: "Atlantic/Canary" })}</p></div>
        </div>
        <Link href={"/clubs/" + membership.club.id} className="mt-7 inline-block text-xs font-bold uppercase tracking-wider text-orange-400 underline">Ver club ↗</Link>
        <p className="mt-3 text-[11px] text-zinc-500">Identificador visual. No válido como entrada ni acreditación de identidad.</p>
      </div>
    </article>
  );
}
