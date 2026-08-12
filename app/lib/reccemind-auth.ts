import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { isAdminRole } from "@/app/lib/admin-auth";

export const RECCEMIND_TESTER_ROLE = "reccemind_tester";

export function isRecceMindRole(role: string | null | undefined) {
  return isAdminRole(role) || role === RECCEMIND_TESTER_ROLE;
}

export async function getCurrentRecceMindSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !isRecceMindRole(session.user.role)) {
    return null;
  }

  return session;
}
