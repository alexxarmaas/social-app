import type { Metadata } from "next";
import CommunityAuthForm from "@/components/community/CommunityAuthForm";

export const metadata: Metadata = { title: "Entrar a Tramassso", robots: { index: false, follow: false } };

export default function LoginPage() {
  return <CommunityAuthForm mode="login" />;
}
