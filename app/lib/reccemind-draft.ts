import type { RecceMindAnalysis } from "@/app/lib/reccemind";

export const RECCEMIND_DRAFT_STORAGE_KEY = "reccemind:draft:v1";

export interface RecceMindLocalDraft {
  version: 1;
  savedAt: string;
  stageName: string;
  driverId: string;
  result: RecceMindAnalysis;
}

export function serializeRecceMindDraft(draft: Omit<RecceMindLocalDraft, "version" | "savedAt">) {
  return JSON.stringify({
    version: 1,
    savedAt: new Date().toISOString(),
    ...draft,
  } satisfies RecceMindLocalDraft);
}

export function parseRecceMindDraft(raw: string | null): RecceMindLocalDraft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<RecceMindLocalDraft>;
    if (
      parsed.version !== 1
      || typeof parsed.savedAt !== "string"
      || typeof parsed.stageName !== "string"
      || typeof parsed.driverId !== "string"
      || !parsed.result
      || typeof parsed.result !== "object"
      || typeof parsed.result.polyline !== "string"
      || !Array.isArray(parsed.result.curves)
      || !Array.isArray(parsed.result.pacenotes)
      || !Array.isArray(parsed.result.speed_profile)
    ) {
      return null;
    }
    return parsed as RecceMindLocalDraft;
  } catch {
    return null;
  }
}
