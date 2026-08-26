import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";
import { createBonoaSsoCode, getBonoaBaseUrl } from "@/app/lib/bonoa-sso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    const loginUrl = new URL("/acceso-interno-tramassso", request.url);
    loginUrl.searchParams.set("next", "/api/bonoa/sso/start");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const code = await createBonoaSsoCode(userId);
  const target = new URL("/api/auth/tramassso/callback", getBonoaBaseUrl());
  target.searchParams.set("code", code);

  const response = NextResponse.redirect(target, { status: 303 });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
