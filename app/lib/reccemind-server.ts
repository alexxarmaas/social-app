import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/app/lib/admin-auth";
import { checkRateLimit, requestIdentifier } from "@/app/lib/rate-limit";

const DEFAULT_TIMEOUT_MS = 45_000;

function apiBaseUrl() {
  const configured = process.env.RECCEMIND_API_URL?.trim().replace(/\/+$/, "");
  if (!configured) return null;
  return configured.endsWith("/api") ? configured : `${configured}/api`;
}

function timeoutMs() {
  const value = Number(process.env.RECCEMIND_API_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  return Number.isFinite(value) && value >= 1_000 ? value : DEFAULT_TIMEOUT_MS;
}

export async function proxyRecceMind(request: NextRequest, endpoint: string) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }

  const rateLimit = checkRateLimit(
    `reccemind:${session.user.id}:${requestIdentifier(request.headers)}`,
    60,
    60 * 1000,
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes a RecceMind. Intentalo de nuevo en unos segundos." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } },
    );
  }

  const baseUrl = apiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      { error: "RecceMind no esta configurado en este entorno." },
      { status: 503 },
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs());

  try {
    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    const accept = request.headers.get("accept");
    if (contentType) headers.set("Content-Type", contentType);
    if (accept) headers.set("Accept", accept);

    const serviceToken = process.env.RECCEMIND_SERVICE_TOKEN?.trim();
    if (serviceToken) {
      headers.set("X-RecceMind-Token", serviceToken);
    }

    const method = request.method.toUpperCase();
    const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();
    const upstream = await fetch(`${baseUrl}/${endpoint.replace(/^\/+/, "")}`, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: controller.signal,
    });

    const responseBody = await upstream.arrayBuffer();
    const responseHeaders = new Headers();
    responseHeaders.set(
      "Content-Type",
      upstream.headers.get("content-type") ?? "application/json; charset=utf-8",
    );
    responseHeaders.set("Cache-Control", "no-store");

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      {
        error: timedOut
          ? "RecceMind ha tardado demasiado en responder."
          : "No se ha podido conectar con el servicio RecceMind.",
      },
      { status: timedOut ? 504 : 502 },
    );
  } finally {
    clearTimeout(timer);
  }
}
