import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("event migration serializes admission and denies public access to RPC", () => {
  const sql = readFileSync("supabase/migrations/20261024_event_tickets_waitlist.sql", "utf8");
  assert.match(sql, /FROM public\.events WHERE id=p_event_id FOR UPDATE/);
  assert.match(sql, /status IN \('new','confirmed'\)/);
  assert.match(sql, /REVOKE ALL ON FUNCTION public\.trm_checkin_event_v2/);
  assert.match(sql, /TO service_role/);
  assert.match(sql, /checked_in_at IS NULL/);
});
test("Prisma migration keeps existing accounts and content", () => {
  const sql = readFileSync("prisma/migrations/20261024150000_community_v11_security_social/migration.sql", "utf8");
  assert.match(sql, /ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationRequired"/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS "AccountToken"/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS "CarPhoto"/);
  assert.doesNotMatch(sql, /DROP TABLE/);
  assert.doesNotMatch(sql, /TRUNCATE/);
});
