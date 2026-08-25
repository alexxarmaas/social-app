import assert from "node:assert/strict";
import test from "node:test";
import {
  clampCallAheadMeters,
  coordinateAtDistance,
  projectCoordinateOntoRoute,
  routeDistances,
} from "../app/lib/reccemind-geo";

const route = [
  { lat: 28.0, lng: -15.0 },
  { lat: 28.0, lng: -14.999 },
  { lat: 28.0, lng: -14.998 },
];

test("RecceMind projects a GPS point onto the nearest route segment", () => {
  const cumulative = routeDistances(route);
  const projection = projectCoordinateOntoRoute({ lat: 28.00005, lng: -14.9995 }, route, cumulative);
  assert.ok(projection);
  assert.ok(projection.offRouteMeters < 7);
  assert.ok(projection.routeDistance > 40);
  assert.ok(projection.routeDistance < cumulative.at(-1)! - 40);
});

test("RecceMind interpolates a coordinate at route distance", () => {
  const cumulative = routeDistances(route);
  const midpoint = coordinateAtDistance(route, cumulative, cumulative.at(-1)! / 2);
  assert.ok(midpoint);
  assert.ok(Math.abs(midpoint.lat - 28.0) < 0.00001);
  assert.ok(Math.abs(midpoint.lng - -14.999) < 0.0001);
});

test("live call anticipation stays inside operational bounds", () => {
  assert.equal(clampCallAheadMeters(5, 4.5), 70);
  assert.equal(clampCallAheadMeters(30, 4.5), 135);
  assert.equal(clampCallAheadMeters(80, 4.5), 240);
  assert.equal(clampCallAheadMeters(null, 4.5), 99);
});
