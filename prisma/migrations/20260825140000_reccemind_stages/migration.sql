CREATE TABLE "RecceMindStage" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "driverId" TEXT NOT NULL DEFAULT 'default',
    "sourceType" TEXT,
    "sourceName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "analysis" JSONB NOT NULL,
    "thresholds" JSONB,
    "distanceMeters" DOUBLE PRECISION,
    "curveCount" INTEGER NOT NULL DEFAULT 0,
    "noteCount" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecceMindStage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RecceMindStage_ownerId_updatedAt_idx" ON "RecceMindStage"("ownerId", "updatedAt" DESC);

ALTER TABLE "RecceMindStage"
ADD CONSTRAINT "RecceMindStage_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
