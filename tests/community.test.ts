import assert from "node:assert/strict";
import test from "node:test";
import { carSchema, registrationSchema, safeCarImage, usernameSchema } from "../app/lib/community";

test("validates usernames and rejects reserved punctuation", () => {
  assert.equal(usernameSchema.safeParse("driver_24").success, true);
  assert.equal(usernameSchema.safeParse("not/valid").success, false);
  assert.equal(usernameSchema.safeParse("a").success, false);
});

test("requires consent and strong passwords", () => {
  const input = { username: "driver_24", name: "Conductor", email: "driver@example.com", password: "strong-password-2026", consent: true };
  assert.equal(registrationSchema.safeParse(input).success, true);
  assert.equal(registrationSchema.safeParse({ ...input, consent: false }).success, false);
  assert.equal(registrationSchema.safeParse({ ...input, password: "short" }).success, false);
});

test("blocks unsafe external car images", () => {
  assert.equal(safeCarImage("http://res.cloudinary.com/fake/car.jpg"), null);
  assert.equal(safeCarImage("https://example.com/car.jpg"), null);
  assert.equal(safeCarImage("https://res.cloudinary.com/demo/image/upload/car.jpg") !== null, true);
});

test("checks vehicle fields and limits", () => {
  assert.equal(carSchema.safeParse({ make: "Honda", model: "Prelude", year: 1992 }).success, true);
  assert.equal(carSchema.safeParse({ make: "Honda", model: "Prelude", year: 1788 }).success, false);
  assert.equal(carSchema.safeParse({ make: "Honda", model: "Prelude", year: 1992, horsepower: 5000 }).success, false);
});
