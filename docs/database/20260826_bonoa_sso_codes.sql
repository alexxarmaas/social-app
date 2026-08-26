-- Applied directly to tramassso-db on 2026-08-26.
-- This file is intentionally outside prisma/migrations so prisma migrate deploy
-- does not replay a migration that already exists in the database.

CREATE TABLE public."BonoaSsoCode" (
  "id" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BonoaSsoCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BonoaSsoCode_codeHash_key" ON public."BonoaSsoCode"("codeHash");
CREATE INDEX "BonoaSsoCode_expiresAt_idx" ON public."BonoaSsoCode"("expiresAt");
CREATE INDEX "BonoaSsoCode_userId_idx" ON public."BonoaSsoCode"("userId");

ALTER TABLE public."BonoaSsoCode"
  ADD CONSTRAINT "BonoaSsoCode_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES public."User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public."BonoaSsoCode" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."BonoaSsoCode" FROM anon, authenticated;
