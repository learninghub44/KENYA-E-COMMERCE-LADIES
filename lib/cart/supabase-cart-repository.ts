import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartItemRecord, CartItemRepository, CartItemStatus, CartRecord, CartRepository, PurchasableItem } from "../orders/types";

type CartRow = {
  id: string;
  user_id: string | null;
  guest_token: string | null;
  status: CartRecord["status"];
  currency: string;
  created_at: string;
  updated_at: string;
};

type CartItemRow = {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string | null;
  seller_id: string;
  quantity: number;
  unit_price_minor: number;
  currency: string;
  status: CartItemStatus;
  product_snapshot: PurchasableItem;
  created_at: string;
  updated_at: string;
};

function toCartRecord(row: CartRow): CartRecord {
  return {
    id: row.id,
    userId: row.user_id,
    guestToken: row.guest_token,
    status: row.status,
    currency: row.currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toCartItemRecord(row: CartItemRow): CartItemRecord {
  return {
    id: row.id,
    cartId: row.cart_id,
    productId: row.product_id,
    variantId: row.variant_id,
    sellerId: row.seller_id,
    quantity: row.quantity,
    unitPriceMinor: row.unit_price_minor,
    currency: row.currency,
    status: row.status,
    productSnapshot: row.product_snapshot,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

const CART_COLUMNS = "id, user_id, guest_token, status, currency, created_at, updated_at";
const CART_ITEM_COLUMNS = "id, cart_id, product_id, variant_id, seller_id, quantity, unit_price_minor, currency, status, product_snapshot, created_at, updated_at";

export function createSupabaseCartRepository(client: SupabaseClient): CartRepository {
  return {
    async findActiveByUser(userId): Promise<CartRecord | null> {
      const { data, error } = await client
        .from("carts")
        .select(CART_COLUMNS)
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw new Error(`Failed to load cart: ${error.message}`);
      return data ? toCartRecord(data as CartRow) : null;
    },

    async findActiveByGuestToken(guestToken): Promise<CartRecord | null> {
      const { data, error } = await client
        .from("carts")
        .select(CART_COLUMNS)
        .eq("guest_token", guestToken)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw new Error(`Failed to load cart: ${error.message}`);
      return data ? toCartRecord(data as CartRow) : null;
    },

    async findById(cartId): Promise<CartRecord | null> {
      const { data, error } = await client.from("carts").select(CART_COLUMNS).eq("id", cartId).maybeSingle();
      if (error) throw new Error(`Failed to load cart: ${error.message}`);
      return data ? toCartRecord(data as CartRow) : null;
    },

    async create(input): Promise<CartRecord> {
      const { data, error } = await client
        .from("carts")
        .insert({
          user_id: input.userId ?? null,
          guest_token: input.guestToken ?? null,
          currency: input.currency
        })
        .select(CART_COLUMNS)
        .single();
      if (error) throw new Error(`Failed to create cart: ${error.message}`);
      return toCartRecord(data as CartRow);
    },

    async updateCart(input): Promise<CartRecord> {
      const values: Record<string, unknown> = {};
      if (input.values.userId !== undefined) values.user_id = input.values.userId;
      if (input.values.guestToken !== undefined) values.guest_token = input.values.guestToken;
      if (input.values.status !== undefined) values.status = input.values.status;
      if (input.values.currency !== undefined) values.currency = input.values.currency;
      const { data, error } = await client.from("carts").update(values).eq("id", input.cartId).select(CART_COLUMNS).single();
      if (error) throw new Error(`Failed to update cart: ${error.message}`);
      return toCartRecord(data as CartRow);
    }
  };
}

export function createSupabaseCartItemRepository(client: SupabaseClient): CartItemRepository {
  return {
    async listByCart(cartId): Promise<CartItemRecord[]> {
      const { data, error } = await client
        .from("cart_items")
        .select(CART_ITEM_COLUMNS)
        .eq("cart_id", cartId)
        .order("created_at", { ascending: true });
      if (error) throw new Error(`Failed to load cart items: ${error.message}`);
      return ((data ?? []) as CartItemRow[]).map(toCartItemRecord);
    },

    async findLine(input): Promise<CartItemRecord | null> {
      let query = client.from("cart_items").select(CART_ITEM_COLUMNS).eq("cart_id", input.cartId).eq("product_id", input.productId);
      query = input.variantId ? query.eq("variant_id", input.variantId) : query.is("variant_id", null);
      const { data, error } = await query.maybeSingle();
      if (error) throw new Error(`Failed to find cart line: ${error.message}`);
      return data ? toCartItemRecord(data as CartItemRow) : null;
    },

    async upsert(input): Promise<CartItemRecord> {
      const existing = await this.findLine({ cartId: input.cartId, productId: input.productId, variantId: input.variantId ?? null });
      if (existing) {
        const { data, error } = await client
          .from("cart_items")
          .update({
            quantity: input.quantity,
            unit_price_minor: input.unitPriceMinor,
            currency: input.currency,
            status: input.status,
            product_snapshot: input.productSnapshot,
            seller_id: input.sellerId
          })
          .eq("id", existing.id)
          .select(CART_ITEM_COLUMNS)
          .single();
        if (error) throw new Error(`Failed to update cart item: ${error.message}`);
        return toCartItemRecord(data as CartItemRow);
      }
      const { data, error } = await client
        .from("cart_items")
        .insert({
          cart_id: input.cartId,
          product_id: input.productId,
          variant_id: input.variantId ?? null,
          seller_id: input.sellerId,
          quantity: input.quantity,
          unit_price_minor: input.unitPriceMinor,
          currency: input.currency,
          status: input.status,
          product_snapshot: input.productSnapshot
        })
        .select(CART_ITEM_COLUMNS)
        .single();
      if (error) throw new Error(`Failed to add cart item: ${error.message}`);
      return toCartItemRecord(data as CartItemRow);
    },

    async updateItem(input): Promise<CartItemRecord> {
      const values: Record<string, unknown> = {};
      if (input.values.quantity !== undefined) values.quantity = input.values.quantity;
      if (input.values.status !== undefined) values.status = input.values.status;
      if (input.values.unitPriceMinor !== undefined) values.unit_price_minor = input.values.unitPriceMinor;
      if (input.values.currency !== undefined) values.currency = input.values.currency;
      if (input.values.productSnapshot !== undefined) values.product_snapshot = input.values.productSnapshot;
      const { data, error } = await client.from("cart_items").update(values).eq("id", input.itemId).select(CART_ITEM_COLUMNS).single();
      if (error) throw new Error(`Failed to update cart item: ${error.message}`);
      return toCartItemRecord(data as CartItemRow);
    },

    async deleteItem(itemId): Promise<void> {
      const { error } = await client.from("cart_items").delete().eq("id", itemId);
      if (error) throw new Error(`Failed to delete cart item: ${error.message}`);
    },

    async moveItems(input): Promise<void> {
      const { error } = await client.from("cart_items").update({ cart_id: input.toCartId }).eq("cart_id", input.fromCartId);
      if (error) throw new Error(`Failed to move cart items: ${error.message}`);
    }
  };
}
