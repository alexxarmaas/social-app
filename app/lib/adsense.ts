const ADSENSE_CLIENT_ID_PATTERN = /^ca-pub-\d{10,}$/;
const ADSENSE_SLOT_PATTERN = /^\d{8,}$/;

export function getValidAdsenseClientId() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();

  if (!clientId || !ADSENSE_CLIENT_ID_PATTERN.test(clientId)) {
    return null;
  }

  return clientId;
}

export function isValidAdsenseSlot(slot: string) {
  return ADSENSE_SLOT_PATTERN.test(slot.trim());
}