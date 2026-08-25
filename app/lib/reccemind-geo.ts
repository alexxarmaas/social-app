import type { RecceMindCoordinate } from "@/app/lib/reccemind";

const EARTH_RADIUS_M = 6_371_000;
const METERS_PER_DEGREE_LAT = Math.PI * EARTH_RADIUS_M / 180;

export interface RecceMindRouteProjection {
  coordinate: RecceMindCoordinate;
  routeDistance: number;
  offRouteMeters: number;
  segmentIndex: number;
}

export function segmentDistance(a: RecceMindCoordinate, b: RecceMindCoordinate) {
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const deltaLat = (b.lat - a.lat) * Math.PI / 180;
  const deltaLon = (b.lng - a.lng) * Math.PI / 180;
  const sinLat = Math.sin(deltaLat / 2);
  const sinLon = Math.sin(deltaLon / 2);
  const value = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(Math.max(0, 1 - value)));
}

export function routeDistances(coordinates: RecceMindCoordinate[]) {
  if (!coordinates.length) return [];
  const cumulative = [0];
  for (let index = 1; index < coordinates.length; index += 1) {
    cumulative.push(cumulative[index - 1] + segmentDistance(coordinates[index - 1], coordinates[index]));
  }
  return cumulative;
}

export function indexAtDistance(cumulative: number[], distance: number) {
  if (cumulative.length <= 1 || distance <= 0) return 0;
  if (distance >= (cumulative.at(-1) ?? 0)) return cumulative.length - 1;

  let low = 1;
  let high = cumulative.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (cumulative[mid] < distance) low = mid + 1;
    else high = mid;
  }
  return low;
}

export function coordinateAtDistance(
  coordinates: RecceMindCoordinate[],
  cumulative: number[],
  distance: number,
) {
  if (!coordinates.length) return null;
  if (distance <= 0) return coordinates[0];
  const total = cumulative.at(-1) ?? 0;
  if (distance >= total) return coordinates.at(-1) ?? null;

  const endIndex = indexAtDistance(cumulative, distance);
  const startIndex = Math.max(0, endIndex - 1);
  const startDistance = cumulative[startIndex];
  const endDistance = cumulative[endIndex];
  const span = Math.max(0.001, endDistance - startDistance);
  const ratio = Math.max(0, Math.min(1, (distance - startDistance) / span));
  const start = coordinates[startIndex];
  const end = coordinates[endIndex];
  return {
    lat: start.lat + (end.lat - start.lat) * ratio,
    lng: start.lng + (end.lng - start.lng) * ratio,
  };
}

export function projectCoordinateOntoRoute(
  point: RecceMindCoordinate,
  coordinates: RecceMindCoordinate[],
  cumulative = routeDistances(coordinates),
): RecceMindRouteProjection | null {
  if (coordinates.length < 2 || cumulative.length !== coordinates.length) return null;

  const metersPerDegreeLon = METERS_PER_DEGREE_LAT * Math.max(0.1, Math.cos(point.lat * Math.PI / 180));
  let best: RecceMindRouteProjection | null = null;

  for (let index = 0; index < coordinates.length - 1; index += 1) {
    const start = coordinates[index];
    const end = coordinates[index + 1];
    const ax = (start.lng - point.lng) * metersPerDegreeLon;
    const ay = (start.lat - point.lat) * METERS_PER_DEGREE_LAT;
    const bx = (end.lng - point.lng) * metersPerDegreeLon;
    const by = (end.lat - point.lat) * METERS_PER_DEGREE_LAT;
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSquared = dx * dx + dy * dy;
    const ratio = lengthSquared <= 0
      ? 0
      : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared));
    const projectedX = ax + ratio * dx;
    const projectedY = ay + ratio * dy;
    const offRouteMeters = Math.hypot(projectedX, projectedY);

    if (best && offRouteMeters >= best.offRouteMeters) continue;

    const segmentMeters = Math.max(0, cumulative[index + 1] - cumulative[index]);
    best = {
      coordinate: {
        lat: start.lat + (end.lat - start.lat) * ratio,
        lng: start.lng + (end.lng - start.lng) * ratio,
      },
      routeDistance: cumulative[index] + segmentMeters * ratio,
      offRouteMeters,
      segmentIndex: index,
    };
  }

  return best;
}

export function clampCallAheadMeters(speedMps: number | null | undefined, leadSeconds = 4.5) {
  const speed = Number.isFinite(speedMps) && (speedMps ?? 0) > 0 ? Number(speedMps) : 22;
  return Math.round(Math.max(70, Math.min(240, speed * leadSeconds)));
}
