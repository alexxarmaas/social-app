import assert from "node:assert/strict";
import test from "node:test";
import { validAccountToken, hashAccountToken } from "../app/lib/community-security";
test("account tokens are validated without accepting arbitrary urls", () => {
  const valid = "a".repeat(43);
  assert.equal(validAccountToken(valid), true);
  assert.equal(validAccountToken("https://example.com"), false);
  assert.equal(validAccountToken("a".repeat(100)), false);
  assert.equal(hashAccountToken(valid).length, 64);
});
