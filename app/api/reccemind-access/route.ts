import { NextResponse } from "next/server";
import { getCurrentRecceMindSession } from "@/app/lib/reccemind-auth";

export async function GET() {
  const session = await getCurrentRecceMindSession();
  if (!session) {
    return NextResponse.json({ allowed: false }, { status: 403 });
  }

  return NextResponse.json({
    allowed: true,
    role: session.user.role,
  });
}
