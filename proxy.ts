import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { blocksPreviewMutation } from "@/app/lib/staging-guard";

export function proxy(request: NextRequest) {
  if (blocksPreviewMutation(request.method, process.env, request.nextUrl.pathname)) {
    return NextResponse.json(
      { error: "Modo de solo lectura. Activa primero el staging aislado para realizar cambios." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
