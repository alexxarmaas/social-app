import assert from "node:assert/strict";
import test from "node:test";
import { parseRecceMindDraft, serializeRecceMindDraft } from "../app/lib/reccemind-draft";
import { buildRecceMindPrintDocument, buildRecceMindPrintRows, rallyDistance } from "../app/lib/reccemind-print";
import { renderRecceMindPacenote, type RecceMindAnalysis } from "../app/lib/reccemind";

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

test("RecceMind print rows pair calls with rounded following distances", () => {
  const result: RecceMindAnalysis = {
    polyline: "",
    curves: [],
    speed_profile: [],
    pacenotes: [
      { type: "note", text: "Derecha 6 larga", curve_index: 0, distance: 120 },
      { type: "distance", text: "105", curve_index: null, distance: 225 },
      { type: "note", text: "Izquierda 4 no cortar", curve_index: 1, distance: 225 },
    ],
  };

  assert.equal(rallyDistance("105"), "100");
  assert.deepEqual(buildRecceMindPrintRows(result), [
    { positionMeters: 120, note: "Derecha 6 larga", nextDistance: "100" },
    { positionMeters: 225, note: "Izquierda 4 no cortar", nextDistance: null },
  ]);
});

test("RecceMind print document contains rally sheet structure", () => {
  const result: RecceMindAnalysis = {
    polyline: "",
    curves: [],
    speed_profile: [],
    distanceMeters: 1234,
    pacenotes: [
      { type: "note", text: "Derecha 5 en rasante", curve_index: 0, distance: 100 },
    ],
  };

  const html = buildRecceMindPrintDocument(result, {
    driverId: "Piloto Demo",
    stageName: "TC Demo",
    generatedAt: new Date("2026-08-22T12:00:00Z"),
  });

  assert.match(html, /TC Demo/);
  assert.match(html, /Piloto Demo/);
  assert.match(html, /Salida/);
  assert.match(html, /Meta/);
  assert.match(html, /Derecha 5 en rasante/);
  assert.match(html, /Imprimir \/ Guardar PDF/);
});

test("RecceMind local drafts preserve the edited analysis and stage name", () => {
  const result: RecceMindAnalysis = {
    polyline: "abc",
    curves: [],
    speed_profile: [80, 70],
    sourceName: "TC VMRM",
    pacenotes: [
      { type: "note", text: "Derecha 4 no cortar", curve_index: 0, distance: 150 },
      { type: "distance", text: "100", curve_index: null, distance: 250 },
    ],
  };

  const serialized = serializeRecceMindDraft({
    result,
    stageName: "TC 3 · Artenara",
    driverId: "Piloto Demo",
  });
  const restored = parseRecceMindDraft(serialized);

  assert.ok(restored);
  assert.equal(restored.stageName, "TC 3 · Artenara");
  assert.equal(restored.driverId, "Piloto Demo");
  assert.deepEqual(restored.result, result);
  assert.equal(parseRecceMindDraft("not-json"), null);
});
