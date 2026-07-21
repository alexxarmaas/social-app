const ADSENSE_CLIENT_ID_PATTERN = /^ca-pub-\d{10,}$/;
const ADSENSE_SLOT_PATTERN = /^\d{8,}$/;
const TRAMASSSO_ADSENSE_CLIENT_ID = "ca-pub-2456720977453256";

export function getValidAdsenseClientId() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();

  return clientId && ADSENSE_CLIENT_ID_PATTERN.test(clientId)
    ? clientId
    : TRAMASSSO_ADSENSE_CLIENT_ID;
}

export function isValidAdsenseSlot(slot: string) {
  return ADSENSE_SLOT_PATTERN.test(slot.trim());
}
