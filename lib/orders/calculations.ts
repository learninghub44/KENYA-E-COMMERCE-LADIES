import type { CartItemRecord, CouponRecord, DiscountLine } from "./types.js";

export type CalculationInput = {
  items: Pick<CartItemRecord, "sellerId" | "quantity" | "unitPriceMinor" | "currency">[];
  coupon?: CouponRecord | null | undefined;
  now?: string | undefined;
};

export type CalculationResult = {
  subtotalMinor: number;
  discountMinor: number;
  shippingMinor: number;
  taxMinor: number;
  totalMinor: number;
  currency: string;
  discounts: DiscountLine[];
};

function couponIsUsable(coupon: CouponRecord, subtotalMinor: number, currency: string, now: string): boolean {
  if (!coupon.isActive) return false;
  if (coupon.currency && coupon.currency !== currency) return false;
  if (subtotalMinor < coupon.minSubtotalMinor) return false;
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return false;
  if (coupon.startsAt && coupon.startsAt > now) return false;
  if (coupon.endsAt && coupon.endsAt < now) return false;
  return true;
}

export function calculateOrderTotals(input: CalculationInput): CalculationResult {
  const subtotalMinor = input.items.reduce((sum, item) => sum + item.unitPriceMinor * item.quantity, 0);
  const currency = input.items[0]?.currency ?? input.coupon?.currency ?? "KES";
  const now = input.now ?? new Date().toISOString();
  const sellerSubtotal = new Map<string, number>();
  for (const item of input.items) {
    sellerSubtotal.set(item.sellerId, (sellerSubtotal.get(item.sellerId) ?? 0) + item.unitPriceMinor * item.quantity);
  }

  let discountMinor = 0;
  const discounts: DiscountLine[] = [];
  const coupon = input.coupon;
  if (coupon && couponIsUsable(coupon, subtotalMinor, currency, now)) {
    const eligibleSubtotal =
      coupon.scope === "seller" && coupon.sellerId ? sellerSubtotal.get(coupon.sellerId) ?? 0 : subtotalMinor;
    const rawDiscount = coupon.type === "percentage" ? Math.floor((eligibleSubtotal * coupon.value) / 100) : coupon.value;
    discountMinor = Math.min(rawDiscount, eligibleSubtotal);
    if (discountMinor > 0) {
      discounts.push({ couponId: coupon.id, code: coupon.code, amountMinor: discountMinor, sellerId: coupon.sellerId });
    }
  }

  const shippingMinor = 0;
  const taxMinor = 0;
  const totalMinor = Math.max(0, subtotalMinor - discountMinor + shippingMinor + taxMinor);
  return { subtotalMinor, discountMinor, shippingMinor, taxMinor, totalMinor, currency, discounts };
}

export function calculateCartSummary(items: Pick<CartItemRecord, "quantity" | "unitPriceMinor" | "currency">[]) {
  const subtotalMinor = items.reduce((sum, item) => sum + item.unitPriceMinor * item.quantity, 0);
  return {
    subtotalMinor,
    discountMinor: 0,
    shippingMinor: 0,
    taxMinor: 0,
    totalMinor: subtotalMinor,
    currency: items[0]?.currency ?? "KES"
  };
}
