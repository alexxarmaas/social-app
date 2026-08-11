import { NextRequest, NextResponse } from "next/server";
import { proxyRecceMind } from "@/app/lib/reccemind-server";

const ALLOWED_ENDPOINTS = new Set([
  "health",
  "analyze-route",
  "process-polyline",
  "process-gpx",
  "process-telemetry",
  "process-coords",
  "feedback",
  "speech-to-text",
]);

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function endpointFromContext(context: RouteContext) {
  const { path } = await context.params;
  return path.join("/");
}

async function handle(request: NextRequest, context: RouteContext) {
  const endpoint = await endpointFromContext(context);
  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return NextResponse.json({ error: "Endpoint de RecceMind no permitido." }, { status: 404 });
  }
  return proxyRecceMind(request, endpoint);
}

export async function GET(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}
