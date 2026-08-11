import assert from "node:assert/strict";
import test from "node:test";
import { renderRecceMindPacenote } from "../app/lib/reccemind";

test("RecceMind renders compound tightening curves", () => {
  assert.equal(
    renderRecceMindPacenote({
      kind: "curve",
      direction: "right",
      severity: 5,
      target_severity: 2,
      length: "long",
      modifiers: ["tightens"],
      warnings: [],
    }),
    "Derecha 5 larga se cierra a 2",
  );
});

test("RecceMind renders opening curves with warnings and gear", () => {
  assert.equal(
    renderRecceMindPacenote({
      kind: "curve",
      direction: "left",
      severity: 2,
      target_severity: 5,
      length: "standard",
      modifiers: ["opens"],
      warnings: ["caution", "brake"],
      gear: 3,
    }),
    "Ojo Frena Izquierda 2 se abre a 5 en 3ª",
  );
});

test("RecceMind renders non-curve structured events", () => {
  assert.equal(renderRecceMindPacenote({ kind: "distance", meters: 52.4 }), "52");
  assert.equal(renderRecceMindPacenote({ kind: "crest" }), "Rasante");
  assert.equal(renderRecceMindPacenote({ kind: "jump" }), "Salto");
  assert.equal(renderRecceMindPacenote({ kind: "custom", label: "Puente" }), "Puente");
});
