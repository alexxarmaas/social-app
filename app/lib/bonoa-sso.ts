import { createHash, randomBytes, randomUUID } from "node:crypto";
import { prisma } from "@/app/lib/prisma";

const CODE_TTL_MS = 60_000;
const CODE_PATTERN = /^[A-Za-z0-9_-]{40,64}$/;

type BonoaSsoIdentity = {
  id: string;
  email: string;
  name: string | null;
  username: string;
};

function hashCode(code: string) {
  return createHash("sha256").update(code, "utf8").digest("hex");
}

export function isValidBonoaSsoCode(code: unknown): code is string {
  return typeof code === "string" && CODE_PATTERN.test(code);
}

export async function createBonoaSsoCode(userId: string) {
  const code = randomBytes(32).toString("base64url");
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  await prisma.$transaction([
    prisma.$executeRaw`DELETE FROM public."BonoaSsoCode" WHERE "expiresAt" < CURRENT_TIMESTAMP OR "usedAt" IS NOT NULL`,
    prisma.$executeRaw`
      INSERT INTO public."BonoaSsoCode" ("id", "codeHash", "userId", "expiresAt")
      VALUES (${randomUUID()}, ${codeHash}, ${userId}, ${expiresAt})
    `,
  ]);

  return code;
}

export async function exchangeBonoaSsoCode(code: string): Promise<BonoaSsoIdentity | null> {
  if (!isValidBonoaSsoCode(code)) return null;

  const codeHash = hashCode(code);
  const rows = await prisma.$queryRaw<BonoaSsoIdentity[]>`
    WITH consumed AS (
      UPDATE public."BonoaSsoCode"
      SET "usedAt" = CURRENT_TIMESTAMP
      WHERE "codeHash" = ${codeHash}
        AND "usedAt" IS NULL
        AND "expiresAt" > CURRENT_TIMESTAMP
      RETURNING "userId"
    )
    SELECT u."id", u."email", u."name", u."username"
    FROM consumed c
    INNER JOIN public."User" u ON u."id" = c."userId"
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export function getBonoaBaseUrl() {
  const configured = process.env.BONOA_URL ?? process.env.NEXT_PUBLIC_BONOA_URL ?? "https://bonoa.vercel.app";
  const url = new URL(configured);
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";

  if ((!local && url.protocol !== "https:") || (local && !["http:", "https:"].includes(url.protocol))) {
    throw new Error("BONOA_URL debe usar HTTPS fuera de local.");
  }
  if (url.username || url.password) throw new Error("BONOA_URL no puede contener credenciales.");

  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url;
}
