import assert from "node:assert/strict";
import test from "node:test";
import { moderationInputSchema, postInputSchema, reportInputSchema, commentInputSchema } from "../app/lib/community-social";
import { registrationStatusSchema, registrationInputSchema } from "../app/lib/event-registrations";

test("posts require meaningful content and trusted media", () => {
  assert.equal(postInputSchema.safeParse({ content: "Acabo de montar nuevas llantas" }).success, true);
  assert.equal(postInputSchema.safeParse({ content: "hey" }).success, false);
  assert.equal(postInputSchema.safeParse({ content: "A".repeat(1201) }).success, false);
  assert.equal(postInputSchema.safeParse({ content: "Nuevo proyecto en el garaje", imageUrl: "javascript:alert(1)" }).success, false);
  assert.equal(postInputSchema.safeParse({ content: "Nuevo proyecto en el garaje", clubId: "invalid" }).success, false);
});

test("moderation and reports accept only allowed values", () => {
  assert.equal(moderationInputSchema.safeParse({ status: "published" }).success, true);
  assert.equal(moderationInputSchema.safeParse({ status: "hidden" }).success, true);
  assert.equal(moderationInputSchema.safeParse({ status: "superadmin" }).success, false);
  assert.equal(reportInputSchema.safeParse({ reason: "privacidad" }).success, true);
  assert.equal(reportInputSchema.safeParse({ reason: "whatever" }).success, false);
});

test("waitlist and guest consent are validated", () => {
  assert.equal(registrationStatusSchema.safeParse("waitlisted").success, true);
  assert.equal(registrationStatusSchema.safeParse("checked_in").success, false);
  const valid = { name: "Maria Lopez", email: "maria@example.com", vehicle: "Honda Prelude", license_plate: "1234 ABC", privacy: true };
  assert.equal(registrationInputSchema.safeParse(valid).success, true);
  assert.equal(registrationInputSchema.safeParse({ ...valid, privacy: false }).success, false);
});


test("comments require a short, moderated text", () => {
  assert.equal(commentInputSchema.safeParse({ content: "Qué bonito Prelude" }).success, true);
  assert.equal(commentInputSchema.safeParse({ content: "ok" }).success, false);
  assert.equal(commentInputSchema.safeParse({ content: "X".repeat(601) }).success, false);
  assert.equal(commentInputSchema.safeParse({ content: "Hola", status: "published" }).success, false);
});
