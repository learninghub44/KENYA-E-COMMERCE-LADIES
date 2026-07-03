export type CommerceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; status: number };

export type Money = {
  amountMinor: number;
  currency: string;
};

export type AddressSnapshot = {
  id?: string | undefined;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string | null | undefined;
  city: string;
  region?: string | null | undefined;
  postalCode?: string | null | undefined;
  countryCode: string;
};

export type PurchasableItem = {
  productId: string;
  variantId?: string | null | undefined;
  sellerId: string;
  sellerName: string;
  productName: string;
  productSlug: string;
  variantTitle?: string | null | undefined;
  sku?: string | null | undefined;
  unitPriceMinor: number;
  currency: string;
  isPublished: boolean;
  inStock: boolean;
};

export type CartStatus = "active" | "converted" | "abandoned";

export type CartItemStatus = "active" | "saved_for_later";

export type CartRecord = {
  id: string;
  userId: string | null;
  guestToken: string | null;
  status: CartStatus;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

export type CartItemRecord = {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  sellerId: string;
  quantity: number;
  unitPriceMinor: number;
  currency: string;
  status: CartItemStatus;
  productSnapshot: PurchasableItem;
  createdAt: string;
  updatedAt: string;
};

export type CartSummary = {
  cart: CartRecord;
  activeItems: CartItemRecord[];
  savedItems: CartItemRecord[];
  subtotalMinor: number;
  discountMinor: number;
  shippingMinor: number;
  taxMinor: number;
  totalMinor: number;
  currency: string;
};

export type CouponType = "percentage" | "fixed";
export type CouponScope = "marketplace" | "seller";

export type CouponRecord = {
  id: string;
  code: string;
  type: CouponType;
  scope: CouponScope;
  sellerId: string | null;
  value: number;
  currency: string | null;
  minSubtotalMinor: number;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
};

export type DiscountLine = {
  couponId: string;
  code: string;
  amountMinor: number;
  sellerId: string | null;
};

export const ORDER_STATUSES = [
  "draft",
  "pending_payment",
  "pending",
  "paid",
  "confirmed",
  "processing",
  "ready_for_shipment",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
  "returned"
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderRecord = {
  id: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  paymentStatus: "unpaid" | "authorized" | "paid" | "failed" | "refunded" | "partially_refunded";
  fulfillmentStatus: "unfulfilled" | "partial" | "fulfilled" | "returned";
  subtotalMinor: number;
  discountMinor: number;
  shippingMinor: number;
  taxMinor: number;
  totalMinor: number;
  currency: string;
  shippingAddress: AddressSnapshot;
  billingAddress: AddressSnapshot | null;
  notes: string | null;
  internalNotes: string | null;
  placedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderItemRecord = {
  id: string;
  orderId: string;
  productId: string | null;
  variantId: string | null;
  sellerId: string;
  productName: string;
  variantTitle: string | null;
  sku: string | null;
  quantity: number;
  unitPriceMinor: number;
  discountMinor: number;
  totalMinor: number;
  currency: string;
  productSnapshot: PurchasableItem;
  sellerSnapshot: { sellerId: string; sellerName: string };
  createdAt: string;
};

export type OrderWithItems = OrderRecord & { items: OrderItemRecord[] };

export type CheckoutDraft = {
  buyerId: string;
  cartId: string;
  shippingAddress: AddressSnapshot;
  billingAddress?: AddressSnapshot | null | undefined;
  couponCode?: string | undefined;
  notes?: string | undefined;
};

export type CheckoutResult = {
  parentOrderNumber: string;
  orders: OrderWithItems[];
};

export type CartRepository = {
  findActiveByUser(userId: string): Promise<CartRecord | null>;
  findActiveByGuestToken(guestToken: string): Promise<CartRecord | null>;
  findById(cartId: string): Promise<CartRecord | null>;
  create(input: { userId?: string | null; guestToken?: string | null; currency: string }): Promise<CartRecord>;
  updateCart(input: { cartId: string; values: Partial<Pick<CartRecord, "userId" | "guestToken" | "status" | "currency">> }): Promise<CartRecord>;
};

export type CartItemRepository = {
  listByCart(cartId: string): Promise<CartItemRecord[]>;
  findLine(input: { cartId: string; productId: string; variantId?: string | null }): Promise<CartItemRecord | null>;
  upsert(input: {
    cartId: string;
    productId: string;
    variantId?: string | null;
    sellerId: string;
    quantity: number;
    unitPriceMinor: number;
    currency: string;
    status: CartItemStatus;
    productSnapshot: PurchasableItem;
  }): Promise<CartItemRecord>;
  updateItem(input: { itemId: string; values: Partial<Pick<CartItemRecord, "quantity" | "status" | "unitPriceMinor" | "currency" | "productSnapshot">> }): Promise<CartItemRecord>;
  deleteItem(itemId: string): Promise<void>;
  moveItems(input: { fromCartId: string; toCartId: string }): Promise<void>;
};

export type ProductReader = {
  getPurchasable(productId: string, variantId?: string | null): Promise<PurchasableItem | null>;
};

export type CouponRepository = {
  findActiveByCode(code: string): Promise<CouponRecord | null>;
  incrementUsage(couponId: string): Promise<void>;
};

export type OrderRepository = {
  createOrder(input: Omit<OrderRecord, "id" | "createdAt" | "updatedAt">): Promise<OrderRecord>;
  addItems(orderId: string, items: Omit<OrderItemRecord, "id" | "orderId" | "createdAt">[]): Promise<OrderItemRecord[]>;
  findById(orderId: string): Promise<OrderWithItems | null>;
  listByBuyer(input: { buyerId: string; cursor?: string | undefined; limit: number }): Promise<{ items: OrderWithItems[]; nextCursor: string | null }>;
  listBySeller(input: { sellerId: string; cursor?: string | undefined; limit: number }): Promise<{ items: OrderWithItems[]; nextCursor: string | null }>;
  updateStatus(input: { orderId: string; status: OrderStatus; fulfillmentStatus?: OrderRecord["fulfillmentStatus"] | undefined }): Promise<OrderRecord>;
  appendHistory(input: { orderId: string; fromStatus: OrderStatus; toStatus: OrderStatus; actorId: string; note?: string | undefined }): Promise<void>;
};

export type InventoryReservationRepository = {
  reserve(items: { productId: string; variantId?: string | null; quantity: number }[]): Promise<{ ok: true } | { ok: false; productId: string; variantId: string | null; available: number }>;
  release(items: { productId: string; variantId?: string | null; quantity: number }[]): Promise<void>;
};

export type CommerceEventPublisher = {
  publish(event: {
    type: "order.created" | "order.confirmed" | "order.cancelled" | "order.status_changed";
    orderId: string;
    buyerId: string;
    sellerId: string;
    metadata?: Record<string, unknown> | undefined;
  }): Promise<void>;
};
