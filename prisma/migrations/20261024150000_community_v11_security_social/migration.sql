-- Additive community v1.1 migration. Never run against production without reviewing backup and rollout.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationRequired" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'published';

CREATE INDEX IF NOT EXISTS "Post_status_createdAt_idx" ON "Post" ("status", "createdAt" DESC);

CREATE TABLE IF NOT EXISTS "AccountToken" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tokenHash" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AccountToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "AccountToken_tokenHash_key" ON "AccountToken" ("tokenHash");
CREATE INDEX IF NOT EXISTS "AccountToken_userId_purpose_expiresAt_idx" ON "AccountToken" ("userId", "purpose", "expiresAt");

CREATE TABLE IF NOT EXISTS "CommunityRateLimit" (
  "key" TEXT NOT NULL PRIMARY KEY,
  "count" INTEGER NOT NULL DEFAULT 0,
  "resetAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "CarPhoto" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "carId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "caption" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CarPhoto_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "CarPhoto_carId_sortOrder_idx" ON "CarPhoto" ("carId", "sortOrder");

CREATE TABLE IF NOT EXISTS "PostReport" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "postId" TEXT NOT NULL,
  "reporterId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PostReport_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "PostReport_postId_reporterId_key" ON "PostReport" ("postId", "reporterId");
CREATE INDEX IF NOT EXISTS "PostReport_postId_idx" ON "PostReport" ("postId");
