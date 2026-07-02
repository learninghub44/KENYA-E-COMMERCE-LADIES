import { calculateOrderTotals } from "../orders/calculations";
import { checkoutSchema, couponCodeSchema } from "../orders/schemas";
import type {
  CartItemRecord,
  CartItemRepository,
  CartRepository,
  CheckoutResult,
  CommerceEventPublisher,
  CommerceResult,
  CouponRepository,
  InventoryReservationRepository,
  OrderItemRecord,
  OrderRepository
} from "../orders/types";

export type CheckoutServiceDependencies = {
  carts: CartRepository;
  cartItems: CartItemRepository;
  coupons: CouponRepository;
  orders: OrderRepository;
  inventory: InventoryReservationRepository;
  events?: CommerceEventPublisher;
  generateOrderNumber?: () => string;
};

function failure(code: string, message: string, status: number): CommerceResult<never> {
  return { ok: false, code, message, status };
}

function groupBySeller(items: CartItemRecord[]): Map<string, CartItemRecord[]> {
  const groups = new Map<string, CartItemRecord[]>();
  for (const item of items) {
    const group = groups.get(item.sellerId) ?? [];
    group.push(item);
    groups.set(item.sellerId, group);
  }
  return groups;
}

function defaultOrderNumber(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function createCheckoutService(deps: CheckoutServiceDependencies) {
  return {
    async confirm(input: unknown): Promise<CommerceResult<CheckoutResult>> {
      const parsed = checkoutSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Checkout input is invalid.", 400);

      const cart = await deps.carts.findById(parsed.data.cartId);
      if (!cart || cart.status !== "active") return failure("NOT_FOUND", "Active cart not found.", 404);
      if (cart.userId !== parsed.data.buyerId) return failure("FORBIDDEN", "You do not own this cart.", 403);

      const items = (await deps.cartItems.listByCart(cart.id)).filter((item) => item.status === "active");
      if (items.length === 0) return failure("EMPTY_CART", "Cart has no active items.", 409);
      if (new Set(items.map((item) => item.currency)).size > 1) {
        return failure("MIXED_CURRENCY", "Checkout requires a single cart currency.", 409);
      }

      const reservation = await deps.inventory.reserve(items.map((item) => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity })));
      if (!reservation.ok) {
        return failure("INSUFFICIENT_STOCK", `Insufficient stock for product ${reservation.productId}.`, 409);
      }

      try {
        const coupon = parsed.data.couponCode ? await deps.coupons.findActiveByCode(couponCodeSchema.parse(parsed.data.couponCode)) : null;
        if (parsed.data.couponCode && !coupon) {
          await deps.inventory.release(items.map((item) => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity })));
          return failure("COUPON_INVALID", "Coupon code is invalid or inactive.", 400);
        }

        const parentOrderNumber = deps.generateOrderNumber?.() ?? defaultOrderNumber();
        const orders = [];
        let index = 1;
        for (const [sellerId, sellerItems] of groupBySeller(items)) {
          const totals = calculateOrderTotals({ items: sellerItems, coupon });
          const order = await deps.orders.createOrder({
            orderNumber: `${parentOrderNumber}-${String(index).padStart(2, "0")}`,
            buyerId: parsed.data.buyerId,
            sellerId,
            status: "confirmed",
            paymentStatus: "unpaid",
            fulfillmentStatus: "unfulfilled",
            subtotalMinor: totals.subtotalMinor,
            discountMinor: totals.discountMinor,
            shippingMinor: totals.shippingMinor,
            taxMinor: totals.taxMinor,
            totalMinor: totals.totalMinor,
            currency: totals.currency,
            shippingAddress: parsed.data.shippingAddress,
            billingAddress: parsed.data.billingAddress ?? parsed.data.shippingAddress,
            notes: parsed.data.notes ?? null,
            internalNotes: null,
            placedAt: new Date().toISOString()
          });
          const orderItems: Omit<OrderItemRecord, "id" | "orderId" | "createdAt">[] = sellerItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            sellerId: item.sellerId,
            productName: item.productSnapshot.productName,
            variantTitle: item.productSnapshot.variantTitle ?? null,
            sku: item.productSnapshot.sku ?? null,
            quantity: item.quantity,
            unitPriceMinor: item.unitPriceMinor,
            discountMinor: 0,
            totalMinor: item.quantity * item.unitPriceMinor,
            currency: item.currency,
            productSnapshot: item.productSnapshot,
            sellerSnapshot: { sellerId: item.sellerId, sellerName: item.productSnapshot.sellerName }
          }));
          const createdItems = await deps.orders.addItems(order.id, orderItems);
          await deps.events?.publish({ type: "order.created", orderId: order.id, buyerId: order.buyerId, sellerId: order.sellerId });
          await deps.events?.publish({ type: "order.confirmed", orderId: order.id, buyerId: order.buyerId, sellerId: order.sellerId });
          orders.push({ ...order, items: createdItems });
          index += 1;
        }
        if (coupon) await deps.coupons.incrementUsage(coupon.id);
        await deps.carts.updateCart({ cartId: cart.id, values: { status: "converted" } });
        return { ok: true, data: { parentOrderNumber, orders } };
      } catch (error) {
        await deps.inventory.release(items.map((item) => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity })));
        throw error;
      }
    }
  };
}
