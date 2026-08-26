import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { exchangeBonoaSsoCode } from "@/app/lib/bonoa-sso";
import { checkRateLimit, requestIdentifier } from "@/app/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  code: z.string().min(40).max(64),
});

function noStoreJson(body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(`bonoa-sso:${requestIdentifier(request.headers)}`, 30, 60_000);
  if (!rateLimit.allowed) {
    const response = noStoreJson({ error: "temporarily_unavailable" }, 429);
    response.headers.set("Retry-After", String(rateLimit.retryAfter));
    return response;
  }

  let input: z.infer<typeof bodySchema>;
  try {
    input = bodySchema.parse(await request.json());
  } catch {
    return noStoreJson({ error: "invalid_request" }, 400);
  }

  try {
    const identity = await exchangeBonoaSsoCode(input.code);
    if (!identity) return noStoreJson({ error: "invalid_or_expired_code" }, 400);

    return noStoreJson({
      id: identity.id,
      email: identity.email,
      name: identity.name,
      username: identity.username,
    });
  } catch {
    return noStoreJson({ error: "exchange_failed" }, 500);
  }
}
