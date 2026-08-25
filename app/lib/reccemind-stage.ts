import { DEFAULT_RECCEMIND_THRESHOLDS, type RecceMindAnalysis, type RecceMindThresholds } from "@/app/lib/reccemind";
import { reviewAnalysis } from "@/app/lib/reccemind-confidence";

export interface RecceMindSavedStageSummary {
  id: string;
  name: string;
  driverId: string;
  sourceType: string | null;
  sourceName: string | null;
  status: string;
  distanceMeters: number | null;
  curveCount: number;
  noteCount: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecceMindSavedStage extends RecceMindSavedStageSummary {
  analysis: RecceMindAnalysis;
  thresholds: RecceMindThresholds;
}

export function isRecceMindAnalysis(value: unknown): value is RecceMindAnalysis {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<RecceMindAnalysis>;
  return typeof candidate.polyline === "string"
    && Array.isArray(candidate.curves)
    && Array.isArray(candidate.pacenotes)
    && Array.isArray(candidate.speed_profile);
}

export function normalizeStageThresholds(value: unknown): RecceMindThresholds {
  if (!value || typeof value !== "object") return DEFAULT_RECCEMIND_THRESHOLDS;
  const candidate = value as Partial<Record<keyof RecceMindThresholds, unknown>>;
  const next = { ...DEFAULT_RECCEMIND_THRESHOLDS };
  for (const level of ["6", "5", "4", "3", "2"] as const) {
    const numeric = Number(candidate[level]);
    if (Number.isFinite(numeric) && numeric > 0) next[level] = numeric;
  }
  return next;
}

export function stageMetrics(analysis: RecceMindAnalysis, thresholds: RecceMindThresholds) {
  const estimatedDistance = analysis.distanceMeters && analysis.distanceMeters > 0
    ? analysis.distanceMeters
    : Math.max(analysis.curves.at(-1)?.end_distance ?? 0, analysis.pacenotes.at(-1)?.distance ?? 0);
  const review = reviewAnalysis(analysis.curves, thresholds);
  return {
    distanceMeters: estimatedDistance || null,
    curveCount: analysis.curves.length,
    noteCount: analysis.pacenotes.filter((note) => note.type === "note").length,
    reviewCount: review.review,
  };
}

export function safeStageName(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, 120);
}

export function safeDriverId(value: unknown) {
  if (typeof value !== "string") return "default";
  return value.trim().slice(0, 100) || "default";
}

export function safeSourceType(value: unknown) {
  if (typeof value !== "string") return null;
  return ["route", "gpx", "kmz", "telemetry", "gps", "saved"].includes(value) ? value : null;
}

export function safeSourceName(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().slice(0, 160);
  return normalized || null;
}
