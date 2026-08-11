export type RecceMindThresholds = Record<"6" | "5" | "4" | "3" | "2", number>;

export interface RecceMindCurve {
  start_idx: number;
  end_idx: number;
  start_distance: number;
  end_distance: number;
  length: number;
  radius: number;
  heading_change: number;
  direction: "Derecha" | "Izquierda" | string;
  modifier?: string;
  classification: number;
  max_speed?: number;
  min_gear?: number;
  max_braking?: number;
}

export interface RecceMindPacenote {
  type: "note" | "distance";
  text: string;
  curve_index: number | null;
  distance: number;
}

export interface RecceMindAnalysis {
  polyline: string;
  curves: RecceMindCurve[];
  pacenotes: RecceMindPacenote[];
  speed_profile: number[];
  distanceMeters?: number;
  duration?: string;
}

export interface RecceMindCoordinate {
  lat: number;
  lng: number;
}

export const DEFAULT_RECCEMIND_THRESHOLDS: RecceMindThresholds = {
  "6": 150,
  "5": 100,
  "4": 60,
  "3": 35,
  "2": 20,
};

export function decodeGooglePolyline(encoded: string): RecceMindCoordinate[] {
  const points: RecceMindCoordinate[] = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  while (index < encoded.length) {
    let byte = 0;
    let shift = 0;
    let result = 0;

    do {
      if (index >= encoded.length) return points;
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    latitude += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;

    do {
      if (index >= encoded.length) return points;
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    longitude += result & 1 ? ~(result >> 1) : result >> 1;
    points.push({ lat: latitude / 1e5, lng: longitude / 1e5 });
  }

  return points;
}

export function formatDuration(value?: string) {
  if (!value) return "—";
  const seconds = Number.parseInt(value.replace(/s$/, ""), 10);
  if (!Number.isFinite(seconds)) return value;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}
