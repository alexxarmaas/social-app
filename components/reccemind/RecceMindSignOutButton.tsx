"use client";

import { signOut } from "next-auth/react";

export default function RecceMindSignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/acceso-reccemind" })}
      className="rounded-full border border-zinc-800 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-400 transition hover:border-white/30 hover:text-white"
    >
      Salir
    </button>
  );
}
