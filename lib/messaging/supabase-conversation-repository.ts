import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ConversationParticipantRole,
  ConversationRecord,
  ConversationRepository,
  CursorPage
} from "./types";

function toConversationRecord(row: Record<string, unknown>): ConversationRecord {
  return {
    id: row.id as string,
    buyerId: row.buyer_id as string,
    sellerId: row.seller_id as string,
    productId: (row.product_id as string | null) ?? null,
    variantId: (row.variant_id as string | null) ?? null,
    orderId: (row.order_id as string | null) ?? null,
    productSnapshot: (row.product_snapshot as ConversationRecord["productSnapshot"] | null) ?? null,
    status: (row.status as ConversationRecord["status"]) ?? "active",
    buyerDeletedAt: (row.buyer_deleted_at as string | null) ?? null,
    sellerDeletedAt: (row.seller_deleted_at as string | null) ?? null,
    buyerUnreadCount: (row.buyer_unread_count as number) ?? 0,
    sellerUnreadCount: (row.seller_unread_count as number) ?? 0,
    lastMessageAt: (row.last_message_at as string | null) ?? null,
    lastMessagePreview: (row.last_message_preview as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string
  };
}

function encodeCursor(value: string): string {
  return Buffer.from(value, "utf-8").toString("base64");
}

function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, "base64").toString("utf-8");
}

export function createSupabaseConversationRepository(client: SupabaseClient): ConversationRepository {
  return {
    async findById(conversationId: string): Promise<ConversationRecord | null> {
      const { data } = await client
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();
      return data ? toConversationRecord(data as Record<string, unknown>) : null;
    },

    async findByParticipants(input: { buyerId: string; sellerId: string; productId: string | null }): Promise<ConversationRecord | null> {
      let query = client
        .from("conversations")
        .select("*")
        .eq("buyer_id", input.buyerId)
        .eq("seller_id", input.sellerId);

      if (input.productId === null) {
        query = query.is("product_id", null);
      } else {
        query = query.eq("product_id", input.productId);
      }

      const { data } = await query.maybeSingle();
      return data ? toConversationRecord(data as Record<string, unknown>) : null;
    },

    async create(input: Omit<ConversationRecord, "id" | "status" | "buyerDeletedAt" | "sellerDeletedAt" | "buyerUnreadCount" | "sellerUnreadCount" | "lastMessageAt" | "lastMessagePreview" | "createdAt" | "updatedAt">): Promise<ConversationRecord> {
      const { data } = await client
        .from("conversations")
        .insert({
          buyer_id: input.buyerId,
          seller_id: input.sellerId,
          product_id: input.productId,
          variant_id: input.variantId,
          order_id: input.orderId,
          product_snapshot: input.productSnapshot
        })
        .select()
        .single();

      if (!data) throw new Error("Failed to create conversation");
      return toConversationRecord(data as Record<string, unknown>);
    },

    async listForBuyer(input: { buyerId: string; cursor?: string | undefined; limit: number; includeArchived: boolean }): Promise<CursorPage<ConversationRecord>> {
      let query = client
        .from("conversations")
        .select("*")
        .eq("buyer_id", input.buyerId)
        .is("buyer_deleted_at", null)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(input.limit + 1);

      if (!input.includeArchived) {
        query = query.eq("status", "active");
      }

      if (input.cursor) {
        query = query.lt("last_message_at", decodeCursor(input.cursor));
      }

      const { data } = await query;
      const rows = (data ?? []) as Record<string, unknown>[];
      const hasMore = rows.length > input.limit;
      const items = rows.slice(0, input.limit).map(toConversationRecord);
      const nextCursor = hasMore && items.length > 0
        ? encodeCursor(items[items.length - 1]!.lastMessageAt ?? items[items.length - 1]!.createdAt)
        : null;

      return { items, nextCursor };
    },

    async listForSeller(input: { sellerId: string; cursor?: string | undefined; limit: number; includeArchived: boolean }): Promise<CursorPage<ConversationRecord>> {
      let query = client
        .from("conversations")
        .select("*")
        .eq("seller_id", input.sellerId)
        .is("seller_deleted_at", null)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(input.limit + 1);

      if (!input.includeArchived) {
        query = query.eq("status", "active");
      }

      if (input.cursor) {
        query = query.lt("last_message_at", decodeCursor(input.cursor));
      }

      const { data } = await query;
      const rows = (data ?? []) as Record<string, unknown>[];
      const hasMore = rows.length > input.limit;
      const items = rows.slice(0, input.limit).map(toConversationRecord);
      const nextCursor = hasMore && items.length > 0
        ? encodeCursor(items[items.length - 1]!.lastMessageAt ?? items[items.length - 1]!.createdAt)
        : null;

      return { items, nextCursor };
    },

    async searchForParticipant(input: { participantId: string; role: ConversationParticipantRole; query: string; cursor?: string | undefined; limit: number }): Promise<CursorPage<ConversationRecord>> {
      const participantField = input.role === "buyer" ? "buyer_id" : "seller_id";
      const deletedField = input.role === "buyer" ? "buyer_deleted_at" : "seller_deleted_at";

      const { data: msgRows } = await client
        .from("messages")
        .select("conversation_id")
        .ilike("body", `%${input.query}%`);

      const matchingConversationIds = [...new Set((msgRows ?? []).map((r: Record<string, unknown>) => r.conversation_id as string))];

      let query = client
        .from("conversations")
        .select("*")
        .eq(participantField, input.participantId)
        .is(deletedField, null);

      const conditions: string[] = [`last_message_preview.ilike.%${input.query}%`];
      if (matchingConversationIds.length > 0) {
        conditions.push(`id.in.(${matchingConversationIds.map((id) => `"${id}"`).join(",")})`);
      }
      query = query.or(conditions.join(","));
      query = query.order("last_message_at", { ascending: false, nullsFirst: false }).limit(input.limit + 1);

      if (input.cursor) {
        query = query.lt("last_message_at", decodeCursor(input.cursor));
      }

      const { data } = await query;
      const rows = (data ?? []) as Record<string, unknown>[];
      const hasMore = rows.length > input.limit;
      const items = rows.slice(0, input.limit).map(toConversationRecord);
      const nextCursor = hasMore && items.length > 0
        ? encodeCursor(items[items.length - 1]!.lastMessageAt ?? items[items.length - 1]!.createdAt)
        : null;

      return { items, nextCursor };
    },

    async updateStatus(input: { conversationId: string; status: ConversationRecord["status"] }): Promise<ConversationRecord> {
      const { data } = await client
        .from("conversations")
        .update({ status: input.status, updated_at: new Date().toISOString() })
        .eq("id", input.conversationId)
        .select()
        .single();

      if (!data) throw new Error("Conversation not found");
      return toConversationRecord(data as Record<string, unknown>);
    },

    async softDeleteForParticipant(input: { conversationId: string; role: ConversationParticipantRole }): Promise<ConversationRecord> {
      const field = input.role === "buyer" ? "buyer_deleted_at" : "seller_deleted_at";
      const { data } = await client
        .from("conversations")
        .update({ [field]: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", input.conversationId)
        .select()
        .single();

      if (!data) throw new Error("Conversation not found");
      return toConversationRecord(data as Record<string, unknown>);
    },

    async resetUnreadCount(input: { conversationId: string; role: ConversationParticipantRole }): Promise<ConversationRecord> {
      const field = input.role === "buyer" ? "buyer_unread_count" : "seller_unread_count";
      const { data } = await client
        .from("conversations")
        .update({ [field]: 0, updated_at: new Date().toISOString() })
        .eq("id", input.conversationId)
        .select()
        .single();

      if (!data) throw new Error("Conversation not found");
      return toConversationRecord(data as Record<string, unknown>);
    }
  };
}
