import { redirect } from "next/navigation";
import { getCurrentAdminSession } from "@/app/lib/admin-auth";
import RecceMindUserManager from "@/components/reccemind/RecceMindUserManager";

export default async function RecceMindUsersPage() {
  const session = await getCurrentAdminSession();
  if (!session) {
    redirect("/reccemind");
  }

  return <RecceMindUserManager />;
}
