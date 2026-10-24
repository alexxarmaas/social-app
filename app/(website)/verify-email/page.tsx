import type { Metadata } from "next";
import AccountLinkForm from "@/components/community/AccountLinkForm";
export const metadata: Metadata = { title: "Verificar correo", robots: { index: false, follow: false } };
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <main className="min-h-screen bg-zinc-950 px-5 py-16 text-white"><div className="mx-auto max-w-xl">
    <h1 className="text-4xl font-black uppercase">Verifica tu cuenta.</h1>
    <p className="mt-4 text-sm text-zinc-400">Confirma el enlace recibido en tu correo. Si ha caducado, solicita otro.</p>
    <AccountLinkForm kind="verify" token={token} />
  </div></main>;
}
