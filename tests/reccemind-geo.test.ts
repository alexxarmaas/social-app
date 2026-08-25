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

test("route matching prefers the current branch on nearby parallel geometry", () => {
  const lower = Array.from({ length: 51 }, (_, index) => ({ lat: 28.0, lng: -15 + index * 0.00001 }));
  const connector = { lat: 28.001, lng: -14.9995 };
  const upper = Array.from({ length: 51 }, (_, index) => ({ lat: 28.00005, lng: -14.9995 - index * 0.00001 }));
  const hairpinLikeRoute = [...lower, connector, ...upper];
  const cumulative = routeDistances(hairpinLikeRoute);
  const point = { lat: 28.00005, lng: -14.99985 };

  const globalMatch = projectCoordinateOntoRoute(point, hairpinLikeRoute, cumulative);
  const branchMatch = projectCoordinateOntoRoute(point, hairpinLikeRoute, cumulative, {
    preferredSegmentIndex: 15,
    searchRadiusSegments: 20,
    reacquireAboveMeters: 100,
  });

  assert.ok(globalMatch);
  assert.ok(branchMatch);
  assert.ok(globalMatch.segmentIndex > 50);
  assert.ok(branchMatch.segmentIndex < 40);
  assert.ok(branchMatch.offRouteMeters < 8);
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
