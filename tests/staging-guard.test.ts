import assert from "node:assert/strict";
import test from "node:test";
import { blocksPreviewMutation, isIsolatedStagingReady } from "../app/lib/staging-guard";

const ref = "abcdefghijklmnopqrst";
const staging = {
  VERCEL_ENV: "preview",
  TRAMASSSO_STAGING_WRITE_ENABLED: "true",
  TRAMASSSO_STAGING_SUPABASE_REF: ref,
  SUPABASE_URL: "https://" + ref + ".supabase.co",
  NEXT_PUBLIC_SUPABASE_URL: "https://" + ref + ".supabase.co",
  DATABASE_URL: "postgresql://postgres." + ref + ":password@aws-0-eu-west-1.pooler.supabase.com:6543/postgres",
  DIRECT_URL: "postgresql://postgres:password@db." + ref + ".supabase.co:5432/postgres",
  NEXTAUTH_URL: "https://tramassso-staging.vercel.app",
  NEXTAUTH_SECRET: "test-only-secret-that-is-at-least-32-characters",
  SUPABASE_SERVICE_ROLE_KEY: "ci-test-key-not-real",
};

test("previews are read-only by default", () => {
  for (const method of ["POST", "PATCH", "PUT", "DELETE"]) {
    assert.equal(blocksPreviewMutation(method, { VERCEL_ENV: "preview" }), true);
  }
  assert.equal(blocksPreviewMutation("GET", { VERCEL_ENV: "preview" }), false);
});

test("isolated staging requires matching DB, service endpoint and origin", () => {
  assert.equal(isIsolatedStagingReady(staging), true);
  assert.equal(blocksPreviewMutation("POST", staging), false);
  assert.equal(blocksPreviewMutation("POST", { ...staging, DIRECT_URL: undefined }), true);
  assert.equal(blocksPreviewMutation("POST", { ...staging, SUPABASE_URL: "https://wrong.supabase.co" }), true);
  assert.equal(blocksPreviewMutation("POST", { ...staging, DATABASE_URL: "postgresql://test@db.fqeoaupcdcrzmziuxxxk.supabase.co:5432/postgres" }), true);
  assert.equal(blocksPreviewMutation("POST", { ...staging, NEXTAUTH_URL: "https://tramassso.com" }), true);
  assert.equal(blocksPreviewMutation("POST", { ...staging, TRAMASSSO_STAGING_WRITE_ENABLED: "false" }), true);
  assert.equal(blocksPreviewMutation("POST", { ...staging, TRAMASSSO_STAGING_SUPABASE_REF: "fqeoaupcdcrzmziuxxxk" }), true);
});

test("staging mode fails closed even when Vercel target is production", () => {
  assert.equal(blocksPreviewMutation("PATCH", { VERCEL_ENV: "production", TRAMASSSO_STAGING_MODE: "true" }), true);
  assert.equal(blocksPreviewMutation("POST", { ...staging, VERCEL_ENV: "production", TRAMASSSO_STAGING_MODE: "true" }), false);
  assert.equal(blocksPreviewMutation("POST", { VERCEL_ENV: "production" }), false);
});
