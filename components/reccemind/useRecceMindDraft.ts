"use client";

import { useEffect, useState } from "react";
import type { RecceMindAnalysis } from "@/app/lib/reccemind";
import {
  parseRecceMindDraft,
  RECCEMIND_DRAFT_STORAGE_KEY,
  serializeRecceMindDraft,
  type RecceMindLocalDraft,
} from "@/app/lib/reccemind-draft";

export function useRecceMindDraft(result: RecceMindAnalysis | null, stageName: string, driverId: string) {
  const [recoverableDraft, setRecoverableDraft] = useState<RecceMindLocalDraft | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const stored = parseRecceMindDraft(window.localStorage.getItem(RECCEMIND_DRAFT_STORAGE_KEY));
    if (!stored) return;
    const timeout = window.setTimeout(() => setRecoverableDraft(stored), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!result) return;
    const timeout = window.setTimeout(() => {
      try {
        const serialized = serializeRecceMindDraft({
          result,
          stageName: stageName.trim() || result.sourceName || "Tramo RecceMind",
          driverId: driverId.trim() || "default",
        });
        window.localStorage.setItem(RECCEMIND_DRAFT_STORAGE_KEY, serialized);
        const saved = parseRecceMindDraft(serialized);
        setLastSavedAt(saved?.savedAt ?? null);
        setRecoverableDraft(saved);
      } catch {
        // localStorage can be unavailable or full; the active session must keep working.
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [driverId, result, stageName]);

  const discardDraft = () => {
    window.localStorage.removeItem(RECCEMIND_DRAFT_STORAGE_KEY);
    setRecoverableDraft(null);
    setLastSavedAt(null);
  };

  return { recoverableDraft, lastSavedAt, discardDraft };
}
