import test from "node:test";
import assert from "node:assert/strict";
import { evaluateLaunch, type LaunchSignals } from "../app/lib/launch-readiness";

const green: LaunchSignals = {
  hasPrismaHistory: true, hasAccountToken: true, hasRateLimit: true,
  hasCarPhoto: true, hasPostReport: true, hasTicketColumn: true, hasCommentModeration: true,
  anonReadsUsers: false, anonDeletesUsers: false, authenticatedEditsCars: false,
  registrationEnabled: true, verificationEnabled: true, securityEnabled: true,
  ticketingEnabled: true, socialEnabled: true, galleryEnabled: true,
};

test("insecure data roles block release", () => {
  assert.deepEqual(evaluateLaunch({ ...green, anonDeletesUsers: true }).filter(f => f.severity === "blocker").map(f => f.id), ["data-access"]);
});
test("missing migrations block release", () => {
  const result = evaluateLaunch({ ...green, hasPrismaHistory: false, hasTicketColumn: false, hasCommentModeration: false });
  assert.equal(result.some(f => f.id === "prisma-history"), true);
  assert.equal(result.some(f => f.id === "tickets-schema"), true);
  assert.equal(result.some(f => f.id === "comments-schema"), true);
});
test("disabled optional features are warnings", () => {
  const result = evaluateLaunch({ ...green, galleryEnabled: false });
  assert.equal(result.some(f => f.severity === "blocker"), false);
  assert.equal(result.some(f => f.id === "community-off"), true);
});
test("all green returns no automatic findings", () => {
  assert.deepEqual(evaluateLaunch(green), []);
});
