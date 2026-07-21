const ADSENSE_CLIENT_ID_PATTERN = /^ca-pub-\d{10,}$/;
const ADSENSE_SLOT_PATTERN = /^(?!0+$)\d{8,}$/;
const TRAMASSSO_ADSENSE_CLIENT_ID = "ca-pub-2456720977453256";

export const TRAMASSSO_ADSENSE_SLOTS = {
  events: "5459298084",
  routes: "4234560335",
} as const;

export function getValidAdsenseClientId() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();

  return clientId && ADSENSE_CLIENT_ID_PATTERN.test(clientId)
    ? clientId
    : TRAMASSSO_ADSENSE_CLIENT_ID;
}

export function isValidAdsenseSlot(slot: string) {
  return ADSENSE_SLOT_PATTERN.test(slot.trim());
}

export function getAdsenseSlot(slot: string | undefined, fallback: string) {
  const candidate = slot?.trim();

  return candidate && isValidAdsenseSlot(candidate) ? candidate : fallback;
}
