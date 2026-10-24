import type { Metadata } from "next";
import CommunityAuthForm from "@/components/community/CommunityAuthForm";

export const metadata: Metadata = { title: "Unete a Tramassso", description: "Crea gratis tu garaje de coches y forma parte de Tramassso." };

export default function RegisterPage() {
  return <CommunityAuthForm mode="register" />;
}
