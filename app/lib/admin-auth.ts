import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function getCurrentAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    return null;
  }

  return session;
}

export function isAdminRole(role: string | null | undefined) {
  return role === "admin" || role === "superadmin";
}
