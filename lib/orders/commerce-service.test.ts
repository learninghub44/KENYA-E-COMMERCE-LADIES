import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createCartService } from "../cart/index.js";
import { createCheckoutService } from "../checkout/index.js";
import {
  calculateOrderTotals,
  createOrderService,
  type CartItemRecord,
  type CartItemRepository,
  type CartRecord,
  type CartRepository,
  type CouponRecord,
  type CouponRepository,
  type InventoryReservationRepository,
  type OrderItemRecord,
  type OrderRecord,
  type OrderRepository,
  type ProductReader,
  type PurchasableItem
} from "./index.js";

const buyerId = "11111111-1111-4111-8111-111111111111";
const sellerA = "22222222-2222-4222-8222-222222222222";
const sellerB = "33333333-3333-4333-8333-333333333333";
const productA = "44444444-4444-4444-8444-444444444444";
const productB = "55555555-5555-4555-8555-555555555555";
const itemA = "66666666-6666-4666-8666-666666666666";
const itemB = "77777777-7777-4777-8777-777777777777";
const cartId = "88888888-8888-4888-8888-888888888888";

function now() {
  return "2026-07-02T00:00:00.000Z";
}

function purchasable(overrides: Partial<PurchasableItem> = {}): PurchasableItem {
  return {
    productId: productA,
    variantId: null,
    sellerId: sellerA,
    sellerName: "Nairobi Style",
    productName: "Silk Dress",
    productSlug: "silk-dress",
    variantTitle: null,
    sku: "SKU-1",
    unitPriceMinor: 250000,
    currency: "KES",
    isPublished: true,
    inStock: true,
    ...overrides
  };
}

function cartRecord(overrides: Partial<CartRecord> = {}): CartRecord {
  return {
    id: cartId,
    userId: buyerId,
    guestToken: null,
    status: "active",
    currency: "KES",
    createdAt: now(),
    updatedAt: now(),
    ...overrides
  };
}

function cartItem(overrides: Partial<CartItemRecord> = {}): CartItemRecord {
  const snapshot = purchasable(overrides.productSnapshot);
  return {
    id: itemA,
    cartId,
    productId: snapshot.productId,
    variantId: snapshot.variantId ?? null,
    sellerId: snapshot.sellerId,
    quantity: 1,
    unitPriceMinor: snapshot.unitPriceMinor,
    currency: snapshot.currency,
    status: "active",
    productSnapshot: snapshot,
    createdAt: now(),
    updatedAt: now(),
    ...overrides
  };
}

function createMemoryDeps(seedCarts: CartRecord[] = [], seedItems: CartItemRecord[] = []) {
  const carts = new Map(seedCarts.map((cart) => [cart.id, cart]));
  const items = new Map(seedItems.map((item) => [item.id, item]));
  const products = new Map<string, PurchasableItem>([
    [productA, purchasable()],
    [productB, purchasable({ productId: productB, sellerId: sellerB, sellerName: "Glow Hub", productName: "Face Serum", productSlug: "face-serum", unitPriceMinor: 180000 })]
  ]);
  let cartCounter = 1;
  let itemCounter = 1;

  const cartRepository: CartRepository = {
    async findActiveByUser(userId) {
      return [...carts.values()].find((cart) => cart.userId === userId && cart.status === "active") ?? null;
    },
    async findActiveByGuestToken(guestToken) {
      return [...carts.values()].find((cart) => cart.guestToken === guestToken && cart.status === "active") ?? null;
    },
    async findById(id) {
      return carts.get(id) ?? null;
    },
    async create(input) {
      const created = cartRecord({
        id: input.userId === buyerId ? cartId : `88888888-8888-4888-8888-8888888888${String(cartCounter++).padStart(2, "0")}`,
        userId: input.userId ?? null,
        guestToken: input.guestToken ?? null,
        currency: input.currency
      });
      carts.set(created.id, created);
      return created;
    },
    async updateCart(input) {
      const existing = carts.get(input.cartId);
      assert.ok(existing);
      const updated = { ...existing, ...input.values, updatedAt: now() };
      carts.set(input.cartId, updated);
      return updated;
    }
  };

  const itemRepository: CartItemRepository = {
    async listByCart(id) {
      return [...items.values()].filter((item) => item.cartId === id);
    },
    async findLine(input) {
      return (
        [...items.values()].find(
          (item) => item.cartId === input.cartId && item.productId === input.productId && item.variantId === (input.variantId ?? null)
        ) ?? null
      );
    },
    async upsert(input) {
      const existing = await this.findLine({ cartId: input.cartId, productId: input.productId, variantId: input.variantId ?? null });
      const record = cartItem({
        ...(existing ? { id: existing.id, createdAt: existing.createdAt } : { id: itemCounter === 1 ? itemA : itemB }),
        cartId: input.cartId,
        productId: input.productId,
        variantId: input.variantId ?? null,
        sellerId: input.sellerId,
        quantity: input.quantity,
        unitPriceMinor: input.unitPriceMinor,
        currency: input.currency,
        status: input.status,
        productSnapshot: input.productSnapshot,
        updatedAt: now()
      });
      itemCounter += 1;
      items.set(record.id, record);
      return record;
    },
    async updateItem(input) {
      const existing = items.get(input.itemId);
      assert.ok(existing);
      const updated = { ...existing, ...input.values, updatedAt: now() };
      items.set(input.itemId, updated);
      return updated;
    },
    async deleteItem(id) {
      items.delete(id);
    },
    async moveItems(input) {
      for (const item of items.values()) {
        if (item.cartId === input.fromCartId) items.set(item.id, { ...item, cartId: input.toCartId });
      }
    }
  };

  const productReader: ProductReader = {
    async getPurchasable(id) {
      return products.get(id) ?? null;
    }
  };

  return { carts, items, products, cartRepository, itemRepository, productReader };
}

function createOrderDeps(stock: Record<string, number> = { [productA]: 10, [productB]: 10 }, coupon: CouponRecord | null = null) {
  const orders = new Map<string, OrderRecord>();
  const orderItems = new Map<string, OrderItemRecord[]>();
  const history: string[] = [];
  let orderCounter = 1;
  let itemCounter = 1;

  const orderRepository: OrderRepository = {
    async createOrder(input) {
      const order: OrderRecord = {
        id: `99999999-9999-4999-8999-9999999999${String(orderCounter++).padStart(2, "0")}`,
        createdAt: now(),
        updatedAt: now(),
        ...input
      };
      orders.set(order.id, order);
      return order;
    },
    async addItems(orderId, inputs) {
      const created = inputs.map((input) => ({
        id: `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa${String(itemCounter++).padStart(2, "0")}`,
        orderId,
        createdAt: now(),
        ...input
      }));
      orderItems.set(orderId, created);
      return created;
    },
    async findById(orderId) {
      const order = orders.get(orderId);
      return order ? { ...order, items: orderItems.get(orderId) ?? [] } : null;
    },
    async listByBuyer(input) {
      return { items: [...orders.values()].filter((order) => order.buyerId === input.buyerId).map((order) => ({ ...order, items: orderItems.get(order.id) ?? [] })), nextCursor: null };
    },
    async listBySeller(input) {
      return { items: [...orders.values()].filter((order) => order.sellerId === input.sellerId).map((order) => ({ ...order, items: orderItems.get(order.id) ?? [] })), nextCursor: null };
    },
    async updateStatus(input) {
      const order = orders.get(input.orderId);
      assert.ok(order);
      const updated = { ...order, status: input.status, fulfillmentStatus: input.fulfillmentStatus ?? order.fulfillmentStatus, updatedAt: now() };
      orders.set(input.orderId, updated);
      return updated;
    },
    async appendHistory(input) {
      history.push(`${input.fromStatus}->${input.toStatus}`);
    }
  };

  const coupons: CouponRepository = {
    async findActiveByCode(code) {
      return coupon && coupon.code === code ? coupon : null;
    },
    async incrementUsage(couponId) {
      if (coupon?.id === couponId) coupon.usedCount += 1;
    }
  };

  const inventory: InventoryReservationRepository = {
    async reserve(items) {
      for (const item of items) {
        const available = stock[item.productId] ?? 0;
        if (available < item.quantity) return { ok: false, productId: item.productId, variantId: item.variantId ?? null, available };
      }
      for (const item of items) stock[item.productId] = (stock[item.productId] ?? 0) - item.quantity;
      return { ok: true };
    },
    async release(items) {
      for (const item of items) stock[item.productId] = (stock[item.productId] ?? 0) + item.quantity;
    }
  };

  const events: string[] = [];
  return { orderRepository, coupons, inventory, orders, history, events, publisher: { async publish(event: { type: string }) { events.push(event.type); } } };
}

describe("commerce engine", () => {
  it("adds items, saves for later, and keeps cart totals on active items only", async () => {
    const deps = createMemoryDeps();
    const service = createCartService({ carts: deps.cartRepository, items: deps.itemRepository, products: deps.productReader });

    const added = await service.add({ userId: buyerId, productId: productA, quantity: 2 });
    assert.equal(added.ok, true);
    assert.equal(added.ok && added.data.totalMinor, 500000);

    const saved = await service.saveForLater({ userId: buyerId, itemId: itemA });
    assert.equal(saved.ok, true);
    assert.equal(saved.ok && saved.data.activeItems.length, 0);
    assert.equal(saved.ok && saved.data.savedItems.length, 1);
    assert.equal(saved.ok && saved.data.totalMinor, 0);
  });

  it("merges a guest cart into the authenticated buyer cart", async () => {
    const guestCart = cartRecord({ id: "88888888-8888-4888-8888-888888888801", userId: null, guestToken: "guest-token-1234567890" });
    const userCart = cartRecord({ id: cartId, userId: buyerId, guestToken: null });
    const deps = createMemoryDeps([guestCart, userCart], [cartItem({ id: itemA, cartId: guestCart.id })]);
    const service = createCartService({ carts: deps.cartRepository, items: deps.itemRepository, products: deps.productReader });

    const result = await service.mergeGuestCart({ userId: buyerId, guestToken: "guest-token-1234567890" });

    assert.equal(result.ok, true);
    assert.equal(result.ok && result.data.activeItems[0]?.cartId, cartId);
    assert.equal(deps.carts.get(guestCart.id)?.status, "converted");
  });

  it("creates one confirmed order per seller and reserves inventory", async () => {
    const cart = cartRecord();
    const deps = createMemoryDeps(
      [cart],
      [
        cartItem({ id: itemA, productSnapshot: purchasable(), sellerId: sellerA }),
        cartItem({ id: itemB, productId: productB, sellerId: sellerB, productSnapshot: purchasable({ productId: productB, sellerId: sellerB, sellerName: "Glow Hub", productName: "Face Serum", productSlug: "face-serum", unitPriceMinor: 180000 }) })
      ]
    );
    const orderDeps = createOrderDeps();
    const checkout = createCheckoutService({
      carts: deps.cartRepository,
      cartItems: deps.itemRepository,
      coupons: orderDeps.coupons,
      orders: orderDeps.orderRepository,
      inventory: orderDeps.inventory,
      events: orderDeps.publisher,
      generateOrderNumber: () => "ORD-TEST"
    });

    const result = await checkout.confirm({
      buyerId,
      cartId,
      shippingAddress: { recipientName: "A Buyer", phone: "+254700000000", line1: "Moi Ave", city: "Nairobi", countryCode: "KE" }
    });

    assert.equal(result.ok, true);
    assert.equal(result.ok && result.data.orders.length, 2);
    assert.deepEqual(orderDeps.events, ["order.created", "order.confirmed", "order.created", "order.confirmed"]);
    assert.equal(deps.carts.get(cartId)?.status, "converted");
  });

  it("rejects checkout when stock cannot be reserved", async () => {
    const deps = createMemoryDeps([cartRecord()], [cartItem({ quantity: 2 })]);
    const orderDeps = createOrderDeps({ [productA]: 1, [productB]: 10 });
    const checkout = createCheckoutService({
      carts: deps.cartRepository,
      cartItems: deps.itemRepository,
      coupons: orderDeps.coupons,
      orders: orderDeps.orderRepository,
      inventory: orderDeps.inventory
    });

    const result = await checkout.confirm({
      buyerId,
      cartId,
      shippingAddress: { recipientName: "A Buyer", phone: "+254700000000", line1: "Moi Ave", city: "Nairobi", countryCode: "KE" }
    });

    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "INSUFFICIENT_STOCK");
  });

  it("calculates percentage coupons without exceeding eligible subtotal", () => {
    const coupon: CouponRecord = {
      id: "coupon-1",
      code: "SAVE10",
      type: "percentage",
      scope: "marketplace",
      sellerId: null,
      value: 10,
      currency: "KES",
      minSubtotalMinor: 0,
      startsAt: null,
      endsAt: null,
      usageLimit: null,
      usedCount: 0,
      isActive: true
    };

    const result = calculateOrderTotals({ items: [cartItem({ quantity: 2 })], coupon, now: now() });
    assert.equal(result.subtotalMinor, 500000);
    assert.equal(result.discountMinor, 50000);
    assert.equal(result.totalMinor, 450000);
  });

  it("prevents invalid order state transitions", async () => {
    const orderDeps = createOrderDeps();
    const created = await orderDeps.orderRepository.createOrder({
      orderNumber: "ORD-1",
      buyerId,
      sellerId: sellerA,
      status: "confirmed",
      paymentStatus: "unpaid",
      fulfillmentStatus: "unfulfilled",
      subtotalMinor: 1000,
      discountMinor: 0,
      shippingMinor: 0,
      taxMinor: 0,
      totalMinor: 1000,
      currency: "KES",
      shippingAddress: { recipientName: "A Buyer", phone: "+254700000000", line1: "Moi Ave", city: "Nairobi", countryCode: "KE" },
      billingAddress: null,
      notes: null,
      internalNotes: null,
      placedAt: now()
    });
    await orderDeps.orderRepository.addItems(created.id, []);
    const service = createOrderService({ orders: orderDeps.orderRepository });

    const result = await service.transition({ orderId: created.id, actorId: sellerA, to: "delivered" });

    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "INVALID_TRANSITION");
  });
});
