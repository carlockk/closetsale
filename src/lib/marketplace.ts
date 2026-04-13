const DEFAULT_PLATFORM_NAME = "ClosetSale";
const DEFAULT_COMMISSION_RATE = 12;

export function getDefaultCommissionRate() {
  return DEFAULT_COMMISSION_RATE;
}

export function getPlatformSellerSnapshot() {
  return {
    sellerId: null,
    sellerName: DEFAULT_PLATFORM_NAME,
    sellerSlug: null,
  };
}

export function getSellerSnapshot(input?: {
  id?: string | null;
  storeName?: string | null;
  slug?: string | null;
}) {
  if (!input?.id || !input.storeName) {
    return getPlatformSellerSnapshot();
  }

  return {
    sellerId: input.id,
    sellerName: input.storeName,
    sellerSlug: input.slug || null,
  };
}
