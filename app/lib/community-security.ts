import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/app/lib/prisma";

/** Shared PostgreSQL limiter; deliberately fails closed if storage is offline. */
export async function persistentRateLimit(key: string, limit: number, windowSeconds: number) {
  const hash = createHash("sha256").update(key).digest("hex");
  try {
    const query = "INSERT INTO \"CommunityRateLimit\" (\"key\", \"count\", \"resetAt\") VALUES ($1, 1, NOW() + ($2::integer * interval '1 second')) " +
      "ON CONFLICT (\"key\") DO UPDATE SET " +
      "\"count\" = CASE WHEN \"CommunityRateLimit\".\"resetAt\" <= NOW() THEN 1 ELSE \"CommunityRateLimit\".\"count\" + 1 END, " +
      "\"resetAt\" = CASE WHEN \"CommunityRateLimit\".\"resetAt\" <= NOW() THEN NOW() + ($2::integer * interval '1 second') ELSE \"CommunityRateLimit\".\"resetAt\" END " +
      "RETURNING \"count\", \"resetAt\"";
    // $queryRawUnsafe with constant SQL and bound parameters: no user input is concatenated.
    const rows = await prisma.$queryRawUnsafe<Array<{ count: number; resetAt: Date }>>(query, hash, windowSeconds);
    const bucket = rows[0];
    return { allowed: Boolean(bucket && bucket.count <= limit), retryAfter: Math.max(1, Math.ceil(((bucket?.resetAt?.getTime() || Date.now() + 60000) - Date.now()) / 1000)) };
  } catch (error) {
    console.error("Community rate limit storage unavailable", error);
    return { allowed: false, retryAfter: 60 };
  }
}
export function hashAccountToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
export function newAccountToken() {
  return randomBytes(32).toString("base64url");
}
export function validAccountToken(token: unknown): token is string {
  return typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);
}
export function communityOrigin() {
  const origin = process.env.NEXTAUTH_URL?.trim();
  if (!origin) return null;
  try {
    const url = new URL(origin);
    if (url.protocol === "https:" || (process.env.NODE_ENV !== "production" && url.hostname === "localhost")) return url.origin;
    return null;
  } catch { return null; }
}
export function communityRegistrationReady() {
  return Boolean(communityOrigin() && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.COMMUNITY_REGISTRATION_ENABLED === "true" && process.env.COMMUNITY_SECURITY_V2_ENABLED === "true" && process.env.COMMUNITY_ACCOUNT_VERIFICATION_ENABLED === "true");
}
export async function issueAccountToken(userId: string, purpose: "verify" | "reset", expiresMinutes: number) {
  const token = newAccountToken();
  const tokenHash = hashAccountToken(token);
  await prisma.$transaction(async (tx) => {
    await tx.accountToken.deleteMany({ where: { userId, purpose } });
    await tx.accountToken.create({
      data: { userId, purpose, tokenHash, expiresAt: new Date(Date.now() + expiresMinutes * 60000) },
    });
  });
  return token;
}
