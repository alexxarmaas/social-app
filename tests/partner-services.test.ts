import assert from "node:assert/strict";
import test from "node:test";
import { partnerServiceListInputSchema } from "../app/lib/partner-services";

test("partner services accept ordered names with optional descriptions", () => {
  const result = partnerServiceListInputSchema.safeParse([
    { name: "Mecanica general", description: "Mantenimiento y reparaciones." },
    { name: "Diagnosis", description: "" },
  ]);

  assert.equal(result.success, true);
});

test("partner services reject empty names and excessive lists", () => {
  assert.equal(partnerServiceListInputSchema.safeParse([{ name: "", description: "Sin nombre" }]).success, false);
  assert.equal(
    partnerServiceListInputSchema.safeParse(
      Array.from({ length: 13 }, (_, index) => ({ name: `Servicio ${index + 1}`, description: "" })),
    ).success,
    false,
  );
});

test("partner services constrain field lengths", () => {
  assert.equal(partnerServiceListInputSchema.safeParse([{ name: "A".repeat(101), description: "" }]).success, false);
  assert.equal(partnerServiceListInputSchema.safeParse([{ name: "Servicio", description: "A".repeat(501) }]).success, false);
});
