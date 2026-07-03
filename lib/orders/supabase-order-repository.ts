import type { SupabaseClient } from "@supabase/supabase-js";
import type { AddressSnapshot, OrderItemRecord, OrderRecord, OrderRepository, OrderStatus, OrderWithItems, PurchasableItem } from "./types";

type OrderRow = {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  status: OrderStatus;
  payment_status: OrderRecord["paymentStatus"];
  fulfillment_status: OrderRecord["fulfillmentStatus"];
  subtotal_minor: number;
  discount_minor: number;
  shipping_minor: number;
  tax_minor: number;
  total_minor: number;
  currency: string;
  shipping_address: AddressSnapshot;
  billing_address: AddressSnapshot | null;
  notes: string | null;
  internal_notes: string | null;
  placed_at: string | null;
  created_at: string;
  updated_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  seller_id: string;
  product_name: string;
  variant_title: string | null;
  sku: string | null;
  quantity: number;
  unit_price_minor: number;
  discount_minor: number | null;
  total_minor: number;
  currency: string;
  product_snapshot: PurchasableItem | null;
  seller_snapshot: { sellerId?: string; sellerName?: string } | null;
  created_at: string;
};

export type AdminOrderListFilters = {
  cursor?: string | undefined;
  limit: number;
  q?: string | undefined;
  status?: OrderStatus | undefined;
};

export type AdminOrderListItem = OrderWithItems & {
  buyerName: string;
  buyerEmail: string | null;
  sellerName: string;
};

function encodeCursor(offset: number): string {
  return Buffer.from(String(offset), "utf-8").toString("base64");
}

function decodeCursor(cursor: string | undefined): number {
  if (!cursor) return 0;
  try {
    const n = Number.parseInt(Buffer.from(cursor, "base64").toString("utf-8"), 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function toOrderRecord(row: OrderRow): OrderRecord {
  return {
    id: row.id,
    orderNumber: row.order_number,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    status: row.status,
    paymentStatus: row.payment_status,
    fulfillmentStatus: row.fulfillment_status,
    subtotalMinor: row.subtotal_minor,
    discountMinor: row.discount_minor,
    shippingMinor: row.shipping_minor,
    taxMinor: row.tax_minor,
    totalMinor: row.total_minor,
    currency: row.currency,
    shippingAddress: row.shipping_address,
    billingAddress: row.billing_address,
    notes: row.notes,
    internalNotes: row.internal_notes,
    placedAt: row.placed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toOrderItemRecord(row: OrderItemRow): OrderItemRecord {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    variantId: row.variant_id,
    sellerId: row.seller_id,
    productName: row.product_name,
    variantTitle: row.variant_title,
    sku: row.sku,
    quantity: row.quantity,
    unitPriceMinor: row.unit_price_minor,
    discountMinor: row.discount_minor ?? 0,
    totalMinor: row.total_minor,
    currency: row.currency,
    productSnapshot:
      row.product_snapshot ??
      {
        productId: row.product_id ?? "",
        variantId: row.variant_id,
        sellerId: row.seller_id,
        sellerName: row.seller_snapshot?.sellerName ?? "",
        productName: row.product_name,
        productSlug: "",
        variantTitle: row.variant_title,
        sku: row.sku,
        unitPriceMinor: row.unit_price_minor,
        currency: row.currency,
        isPublished: false,
        inStock: false
      },
    sellerSnapshot: {
      sellerId: row.seller_snapshot?.sellerId ?? row.seller_id,
      sellerName: row.seller_snapshot?.sellerName ?? ""
    },
    createdAt: row.created_at
  };
}

async function loadItems(client: SupabaseClient, orderIds: string[]): Promise<Map<string, OrderItemRecord[]>> {
  if (orderIds.length === 0) return new Map();
  const { data, error } = await client
    .from("order_items")
    .select("id, order_id, product_id, variant_id, seller_id, product_name, variant_title, sku, quantity, unit_price_minor, discount_minor, total_minor, currency, product_snapshot, seller_snapshot, created_at")
    .in("order_id", orderIds)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Failed to load order items: ${error.message}`);

  const itemsByOrder = new Map<string, OrderItemRecord[]>();
  for (const row of (data ?? []) as OrderItemRow[]) {
    const item = toOrderItemRecord(row);
    const list = itemsByOrder.get(item.orderId) ?? [];
    list.push(item);
    itemsByOrder.set(item.orderId, list);
  }
  return itemsByOrder;
}

async function withItems(client: SupabaseClient, rows: OrderRow[]): Promise<OrderWithItems[]> {
  const itemsByOrder = await loadItems(client, rows.map((row) => row.id));
  return rows.map((row) => ({ ...toOrderRecord(row), items: itemsByOrder.get(row.id) ?? [] }));
}

async function paginateOrders(
  client: SupabaseClient,
  build: (query: any) => any,
  cursor: string | undefined,
  limit: number
): Promise<{ items: OrderWithItems[]; nextCursor: string | null }> {
  const offset = decodeCursor(cursor);
  const query = build(
    client
      .from("orders")
      .select("id, order_number, buyer_id, seller_id, status, payment_status, fulfillment_status, subtotal_minor, discount_minor, shipping_minor, tax_minor, total_minor, currency, shipping_address, billing_address, notes, internal_notes, placed_at, created_at, updated_at", { count: "exact" })
  ).range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to load orders: ${error.message}`);
  const rows = (data ?? []) as OrderRow[];
  const nextOffset = offset + rows.length;
  const nextCursor = count !== null && count !== undefined && nextOffset < count ? encodeCursor(nextOffset) : null;
  return { items: await withItems(client, rows), nextCursor };
}

export function createSupabaseOrderRepository(client: SupabaseClient): OrderRepository {
  return {
    async createOrder(input): Promise<OrderRecord> {
      const { data, error } = await client
        .from("orders")
        .insert({
          order_number: input.orderNumber,
          buyer_id: input.buyerId,
          seller_id: input.sellerId,
          status: input.status,
          payment_status: input.paymentStatus,
          fulfillment_status: input.fulfillmentStatus,
          subtotal_minor: input.subtotalMinor,
          discount_minor: input.discountMinor,
          shipping_minor: input.shippingMinor,
          tax_minor: input.taxMinor,
          total_minor: input.totalMinor,
          currency: input.currency,
          shipping_address: input.shippingAddress,
          billing_address: input.billingAddress,
          notes: input.notes,
          internal_notes: input.internalNotes,
          placed_at: input.placedAt
        })
        .select("*")
        .single();
      if (error) throw new Error(`Failed to create order: ${error.message}`);
      return toOrderRecord(data as OrderRow);
    },

    async addItems(orderId, items): Promise<OrderItemRecord[]> {
      if (items.length === 0) return [];
      const { data, error } = await client
        .from("order_items")
        .insert(
          items.map((item) => ({
            order_id: orderId,
            product_id: item.productId,
            variant_id: item.variantId,
            seller_id: item.sellerId,
            product_name: item.productName,
            variant_title: item.variantTitle,
            sku: item.sku,
            quantity: item.quantity,
            unit_price_minor: item.unitPriceMinor,
            discount_minor: item.discountMinor,
            total_minor: item.totalMinor,
            currency: item.currency,
            product_snapshot: item.productSnapshot,
            seller_snapshot: item.sellerSnapshot
          }))
        )
        .select("*");
      if (error) throw new Error(`Failed to add order items: ${error.message}`);
      return ((data ?? []) as OrderItemRow[]).map(toOrderItemRecord);
    },

    async findById(orderId): Promise<OrderWithItems | null> {
      const { data, error } = await client.from("orders").select("*").eq("id", orderId).maybeSingle();
      if (error) throw new Error(`Failed to load order: ${error.message}`);
      if (!data) return null;
      const [order] = await withItems(client, [data as OrderRow]);
      return order ?? null;
    },

    async listByBuyer(input) {
      return paginateOrders(
        client,
        (query) => query.eq("buyer_id", input.buyerId).order("created_at", { ascending: false }).order("id", { ascending: true }),
        input.cursor,
        input.limit
      );
    },

    async listBySeller(input) {
      return paginateOrders(
        client,
        (query) => query.eq("seller_id", input.sellerId).order("created_at", { ascending: false }).order("id", { ascending: true }),
        input.cursor,
        input.limit
      );
    },

    async updateStatus(input): Promise<OrderRecord> {
      const values: Record<string, unknown> = { status: input.status };
      if (input.fulfillmentStatus !== undefined) values.fulfillment_status = input.fulfillmentStatus;
      const { data, error } = await client.from("orders").update(values).eq("id", input.orderId).select("*").single();
      if (error) throw new Error(`Failed to update order status: ${error.message}`);
      return toOrderRecord(data as OrderRow);
    },

    async appendHistory(input): Promise<void> {
      const { error } = await client.from("order_status_history").insert({
        order_id: input.orderId,
        from_status: input.fromStatus,
        to_status: input.toStatus,
        actor_id: input.actorId,
        note: input.note
      });
      if (error) throw new Error(`Failed to append order history: ${error.message}`);
    }
  };
}

export async function listAdminOrders(client: SupabaseClient, filters: AdminOrderListFilters) {
  const page = await paginateOrders(
    client,
    (query) => {
      let next = query.order("created_at", { ascending: false }).order("id", { ascending: true });
      if (filters.status) next = next.eq("status", filters.status);
      if (filters.q) next = next.ilike("order_number", `%${filters.q}%`);
      return next;
    },
    filters.cursor,
    filters.limit
  );

  const buyerIds = [...new Set(page.items.map((order) => order.buyerId))];
  const sellerIds = [...new Set(page.items.map((order) => order.sellerId))];
  const [{ data: profiles, error: profilesError }, { data: sellers, error: sellersError }] = await Promise.all([
    buyerIds.length
      ? client.from("profiles").select("id, display_name, email").in("id", buyerIds)
      : Promise.resolve({ data: [], error: null }),
    sellerIds.length
      ? client.from("sellers").select("id, store_name").in("id", sellerIds)
      : Promise.resolve({ data: [], error: null })
  ]);
  if (profilesError) throw new Error(`Failed to load order buyers: ${profilesError.message}`);
  if (sellersError) throw new Error(`Failed to load order sellers: ${sellersError.message}`);

  const buyersById = new Map((profiles ?? []).map((row: any) => [row.id, row]));
  const sellersById = new Map((sellers ?? []).map((row: any) => [row.id, row]));
  const items: AdminOrderListItem[] = page.items.map((order) => {
    const buyer = buyersById.get(order.buyerId);
    const seller = sellersById.get(order.sellerId);
    return {
      ...order,
      buyerName: buyer?.display_name ?? buyer?.email ?? "Unknown customer",
      buyerEmail: buyer?.email ?? null,
      sellerName: seller?.store_name ?? order.items[0]?.sellerSnapshot.sellerName ?? "Unknown seller"
    };
  });

  return { items, nextCursor: page.nextCursor };
}
