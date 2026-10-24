import type { Metadata } from "next";
import AccountLinkForm from "@/components/community/AccountLinkForm";
export const metadata: Metadata = { title: "Recuperar contraseña", robots: { index: false, follow: false } };
export default function ForgotPassword() {
  return <main className="min-h-screen bg-zinc-950 px-5 py-16 text-white"><div className="mx-auto max-w-xl">
    <h1 className="text-4xl font-black uppercase">Recupera tu acceso.</h1>
    <p className="mt-4 text-sm text-zinc-400">Te enviaremos instrucciones si el correo pertenece a una cuenta.</p>
    <AccountLinkForm kind="reset" />
  </div></main>;
}
