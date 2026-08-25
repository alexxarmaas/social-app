import type { RecceMindCurve, RecceMindThresholds } from "@/app/lib/reccemind";

export type RecceMindConfidenceLevel = "high" | "medium" | "review";

export interface RecceMindCurveReview {
  index: number;
  score: number;
  level: RecceMindConfidenceLevel;
  needsReview: boolean;
  reasons: string[];
  source: "ml" | "rule" | "fallback";
}

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function fallbackRuleConfidence(radius: number, classification: number, thresholds: RecceMindThresholds) {
  const current: Record<number, number> = {
    6: thresholds["6"],
    5: thresholds["5"],
    4: thresholds["4"],
    3: thresholds["3"],
    2: thresholds["2"],
  };

  let normalizedMargin = 0;
  if (classification >= 6) {
    const boundary = current[6];
    const scale = Math.max(Math.abs(current[6] - current[5]), 10);
    normalizedMargin = clamp((radius - boundary) / scale);
  } else if (classification <= 1) {
    const boundary = current[2];
    const scale = Math.max(Math.abs(current[3] - current[2]), 10);
    normalizedMargin = clamp((boundary - radius) / scale);
  } else {
    const lower = current[classification];
    const upper = current[classification + 1];
    const width = upper - lower;
    if (width <= 0) return 0.55;
    const margin = Math.min(radius - lower, upper - radius);
    normalizedMargin = clamp(margin / (width / 2));
  }

  return 0.55 + 0.4 * normalizedMargin;
}

export function reviewCurve(curve: RecceMindCurve, index: number, thresholds: RecceMindThresholds): RecceMindCurveReview {
  const supplied = curve.classification_confidence;
  const score = clamp(
    typeof supplied === "number" && Number.isFinite(supplied)
      ? supplied
      : fallbackRuleConfidence(curve.radius, curve.classification, thresholds),
  );

  const reasons: string[] = [];
  const entry = curve.entry_classification ?? curve.classification;
  const exit = curve.exit_classification ?? curve.classification;
  const severityDelta = Math.abs(entry - exit);

  if (score < 0.68) {
    reasons.push(curve.classification_source === "ml" ? "El modelo del piloto está indeciso" : "Radio muy próximo a un umbral de grado");
  } else if (score < 0.78) {
    reasons.push("Clasificación con margen reducido");
  }
  if (severityDelta >= 2) reasons.push(`Cambio fuerte de grado ${entry} → ${exit}`);
  if (curve.length < 18) reasons.push("Curva detectada en un tramo muy corto");
  if (Math.abs(curve.heading_change) < 14) reasons.push("Giro geométrico poco marcado");

  const needsReview = score < 0.68 || severityDelta >= 2 || curve.length < 12;
  const level: RecceMindConfidenceLevel = needsReview ? "review" : score < 0.82 ? "medium" : "high";

  return {
    index,
    score,
    level,
    needsReview,
    reasons,
    source: curve.classification_source === "ml" ? "ml" : curve.classification_source === "rule" ? "rule" : "fallback",
  };
}

export function reviewAnalysis(curves: RecceMindCurve[], thresholds: RecceMindThresholds) {
  const items = curves.map((curve, index) => reviewCurve(curve, index, thresholds));
  return {
    items,
    high: items.filter((item) => item.level === "high").length,
    medium: items.filter((item) => item.level === "medium").length,
    review: items.filter((item) => item.needsReview).length,
    average: items.length ? items.reduce((sum, item) => sum + item.score, 0) / items.length : 0,
  };
}
