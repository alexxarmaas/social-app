-- Comments are reviewed before publication.
-- Legacy comments remain published; new ones set status='pending' explicitly.
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'published';
CREATE INDEX IF NOT EXISTS "Comment_postId_status_createdAt_idx"
  ON "Comment" ("postId", "status", "createdAt");
