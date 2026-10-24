import assert from "node:assert/strict";
import test from "node:test";
import { newClubSchema, applicationActionSchema } from "../app/lib/club-community";

test("club names and types are validated", () => {
  assert.equal(newClubSchema.safeParse({ name: "Prelude Club", category: "JDM", location: "Gran Canaria" }).success, true);
  assert.equal(newClubSchema.safeParse({ name: "X", category: "JDM" }).success, false);
  assert.equal(newClubSchema.safeParse({ name: "Prelude Club", category: "invalid" }).success, false);
});

test("membership approvals accept only supported actions", () => {
  const membershipId = "e42c4db9-a4b1-40cd-b26a-b5537dfbc3be";
  assert.equal(applicationActionSchema.safeParse({ membershipId, action: "approved" }).success, true);
  assert.equal(applicationActionSchema.safeParse({ membershipId, action: "admin" }).success, false);
});
