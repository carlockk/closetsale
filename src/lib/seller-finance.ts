const ACTIVE_PAYOUT_STATUSES = ["DRAFT", "PROCESSING", "PAID"] as const;
const RELEASABLE_SELLER_ORDER_STATUS = "DELIVERED";
const PAYOUT_HOLD_DAYS = 7;

type SellerOrderLike = {
  subtotal: unknown;
  commissionAmount: unknown;
  netAmount: unknown;
  status: string;
  updatedAt?: Date | string;
  payoutItems?: Array<{
    payout: {
      status: string;
    };
  }>;
};

type PayoutLike = {
  netAmount: unknown;
  status: string;
};

export function getActivePayoutStatuses() {
  return [...ACTIVE_PAYOUT_STATUSES];
}

export function getPayoutHoldDays() {
  return PAYOUT_HOLD_DAYS;
}

export function isActivePayoutStatus(status: string) {
  return ACTIVE_PAYOUT_STATUSES.includes(
    status as (typeof ACTIVE_PAYOUT_STATUSES)[number],
  );
}

export function getSellerOrderEligibleAt(order: SellerOrderLike) {
  const baseDate = order.updatedAt ? new Date(order.updatedAt) : new Date();
  return new Date(baseDate.getTime() + PAYOUT_HOLD_DAYS * 24 * 60 * 60 * 1000);
}

export function isSellerOrderEligibleForPayout(order: SellerOrderLike) {
  if (order.status !== RELEASABLE_SELLER_ORDER_STATUS) {
    return false;
  }

  if (getSellerOrderEligibleAt(order).getTime() > Date.now()) {
    return false;
  }

  return !(
    order.payoutItems?.some((item) => ACTIVE_PAYOUT_STATUSES.includes(item.payout.status as (typeof ACTIVE_PAYOUT_STATUSES)[number])) ?? false
  );
}

export function getSellerFinanceSummary(input: {
  sellerOrders: SellerOrderLike[];
  payouts: PayoutLike[];
}) {
  const grossSales = input.sellerOrders.reduce((sum, order) => sum + Number(order.subtotal), 0);
  const commissionTotal = input.sellerOrders.reduce(
    (sum, order) => sum + Number(order.commissionAmount),
    0,
  );
  const netSales = input.sellerOrders.reduce((sum, order) => sum + Number(order.netAmount), 0);
  const pendingBalance = input.sellerOrders
    .filter(isSellerOrderEligibleForPayout)
    .reduce((sum, order) => sum + Number(order.netAmount), 0);
  const paidBalance = input.payouts
    .filter((payout) => payout.status === "PAID")
    .reduce((sum, payout) => sum + Number(payout.netAmount), 0);

  return {
    grossSales,
    commissionTotal,
    netSales,
    pendingBalance,
    paidBalance,
  };
}
