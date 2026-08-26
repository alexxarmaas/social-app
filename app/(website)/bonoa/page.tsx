import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import { getBonoaBaseUrl } from "@/app/lib/bonoa-sso";

export const dynamic = "force-dynamic";

export default async function BonoaEntryPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect("/api/bonoa/sso/start");
  }

  redirect(getBonoaBaseUrl().toString());
}
