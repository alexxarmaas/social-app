import test from "node:test";
import assert from "node:assert/strict";
import { buildOnboardingSteps } from "../app/lib/onboarding";

test("new users have three useful tasks while social is unavailable", () => {
  const steps = buildOnboardingSteps({
    hasBio: false, carCount: 0, membershipCount: 0, ownedClubCount: 0,
    approvedPostCount: 0, socialEnabled: false,
  });
  assert.deepEqual(steps.map((step) => step.id), ["profile", "garage", "club"]);
  assert.equal(steps.every((step) => !step.done), true);
});

test("an owned club completes the club step without joining another club", () => {
  const steps = buildOnboardingSteps({
    hasBio: true, carCount: 1, membershipCount: 0, ownedClubCount: 1,
    approvedPostCount: 0, socialEnabled: true,
  });
  assert.deepEqual(steps.map((step) => step.done), [true, true, true, false]);
});

test("an approved social post completes the final community step", () => {
  const steps = buildOnboardingSteps({
    hasBio: true, carCount: 2, membershipCount: 1, ownedClubCount: 0,
    approvedPostCount: 1, socialEnabled: true,
  });
  assert.equal(steps.every((step) => step.done), true);
});
