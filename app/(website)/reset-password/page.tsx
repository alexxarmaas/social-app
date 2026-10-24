import type { Metadata } from "next";
import AccountLinkForm from "@/components/community/AccountLinkForm";
export const metadata: Metadata = { title: "Cambiar contraseña", robots: { index: false, follow: false } };
export default async function ResetPassword({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <main className="min-h-screen bg-zinc-950 px-5 py-16 text-white"><div className="mx-auto max-w-xl">
    <h1 className="text-4xl font-black uppercase">Cambia tu contraseña.</h1>
    <p className="mt-4 text-sm text-zinc-400">El enlace es de un solo uso y caduca en 30 minutos.</p>
    <AccountLinkForm kind="reset" token={token} />
  </div></main>;
}
