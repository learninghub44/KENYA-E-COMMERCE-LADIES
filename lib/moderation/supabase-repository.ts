import type { SupabaseClient } from "@supabase/supabase-js";
import type { CursorPage } from "../audit/types";
import type { MessageModerationGateway, MessageModerationRecord, ModerationQueueItem, ModerationRepository } from "./types";

function encodeCursor(value: string): string {
  return Buffer.from(value, "utf-8").toString("base64");
}

function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, "base64").toString("utf-8");
}

function reportPriority(reason: string): ModerationQueueItem["priority"] {
  if (reason === "fraud" || reason === "harassment") return "urgent";
  if (reason === "counterfeit" || reason === "prohibited_item") return "high";
  return "normal";
}

function reportSummary(row: Record<string, unknown>): string {
  const targetType = row.target_type as string;
  const reason = (row.reason as string).replace(/_/g, " ");
  return `${targetType} reported for ${reason}`;
}

export function createSupabaseModerationRepository(client: SupabaseClient): ModerationRepository {
  return {
    async queue(filters): Promise<CursorPage<ModerationQueueItem>> {
      const limit = filters.limit ?? 50;
      let query = client
        .from("reports")
        .select("*")
        .in("status", ["open", "assigned", "in_review"])
        .order("created_at", { ascending: false })
        .limit(limit + 1);

      if (filters.type && filters.type !== "report") {
        query = query.eq("target_type", filters.type);
      }
      if (filters.assignedTo) query = query.eq("assigned_to", filters.assignedTo);
      if (filters.cursor) query = query.lt("created_at", decodeCursor(filters.cursor));

      const { data } = await query;
      const rows = (data ?? []) as Record<string, unknown>[];
      const hasMore = rows.length > limit;
      const page = rows.slice(0, limit);

      const items: ModerationQueueItem[] = page.map((row) => ({
        id: row.id as string,
        type: (row.target_type as ModerationQueueItem["type"]) ?? "report",
        status: row.status as string,
        priority: reportPriority(row.reason as string),
        createdAt: row.created_at as string,
        summary: reportSummary(row),
        assignedTo: (row.assigned_to as string | null) ?? null
      }));

      const nextCursor = hasMore && items.length > 0 ? encodeCursor(items[items.length - 1]!.createdAt) : null;
      return { items, nextCursor };
    },

    async reportedMessages(filters): Promise<CursorPage<MessageModerationRecord>> {
      const limit = filters.limit ?? 50;
      let query = client
        .from("reports")
        .select("*")
        .eq("target_type", "message")
        .order("created_at", { ascending: false })
        .limit(limit + 1);

      if (filters.cursor) query = query.lt("created_at", decodeCursor(filters.cursor));

      const { data: reportRows } = await query;
      const reports = (reportRows ?? []) as Record<string, unknown>[];
      const hasMore = reports.length > limit;
      const page = reports.slice(0, limit);

      const messageIds = [...new Set(page.map((r) => r.target_id as string))];
      const countByMessage = new Map<string, number>();
      for (const r of reports) {
        const id = r.target_id as string;
        countByMessage.set(id, (countByMessage.get(id) ?? 0) + 1);
      }

      let messagesById = new Map<string, Record<string, unknown>>();
      if (messageIds.length > 0) {
        const { data: messageRows } = await client.from("messages").select("*").in("id", messageIds);
        messagesById = new Map(((messageRows ?? []) as Record<string, unknown>[]).map((m) => [m.id as string, m]));
      }

      const items: MessageModerationRecord[] = page
        .map((r) => messagesById.get(r.target_id as string))
        .filter((m): m is Record<string, unknown> => Boolean(m))
        .map((m) => ({
          id: m.id as string,
          conversationId: m.conversation_id as string,
          senderId: m.sender_id as string,
          body: (m.body as string | null) ?? null,
          deletedAt: (m.deleted_at as string | null) ?? null,
          reportCount: countByMessage.get(m.id as string) ?? 0,
          createdAt: m.created_at as string
        }));

      const nextCursor = hasMore && page.length > 0 ? encodeCursor(page[page.length - 1]!.created_at as string) : null;
      return { items, nextCursor };
    }
  };
}

export function createSupabaseMessageModerationGateway(client: SupabaseClient): MessageModerationGateway {
  async function reportCountFor(messageId: string): Promise<number> {
    const { count } = await client
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("target_type", "message")
      .eq("target_id", messageId);
    return count ?? 0;
  }

  return {
    async findById(messageId: string): Promise<MessageModerationRecord | null> {
      const { data } = await client.from("messages").select("*").eq("id", messageId).maybeSingle();
      if (!data) return null;
      const row = data as Record<string, unknown>;
      return {
        id: row.id as string,
        conversationId: row.conversation_id as string,
        senderId: row.sender_id as string,
        body: (row.body as string | null) ?? null,
        deletedAt: (row.deleted_at as string | null) ?? null,
        reportCount: await reportCountFor(row.id as string),
        createdAt: row.created_at as string
      };
    },

    async softDelete(input): Promise<MessageModerationRecord> {
      const { data, error } = await client
        .from("messages")
        .update({ deleted_at: new Date().toISOString(), deleted_by: input.deletedBy })
        .eq("id", input.messageId)
        .select()
        .single();

      if (error || !data) throw new Error(`Failed to delete message: ${error?.message ?? "unknown error"}`);
      const row = data as Record<string, unknown>;

      await client.from("message_moderation_events").insert({
        message_id: input.messageId,
        conversation_id: row.conversation_id as string,
        event_type: "deleted",
        actor_id: input.deletedBy,
        target_user_id: row.sender_id as string,
        reason: input.reason
      });

      return {
        id: row.id as string,
        conversationId: row.conversation_id as string,
        senderId: row.sender_id as string,
        body: (row.body as string | null) ?? null,
        deletedAt: (row.deleted_at as string | null) ?? null,
        reportCount: await reportCountFor(row.id as string),
        createdAt: row.created_at as string
      };
    },

    async warnUser(input): Promise<void> {
      await client.from("message_moderation_events").insert({
        message_id: null,
        conversation_id: null,
        event_type: "warned",
        actor_id: input.actorId,
        target_user_id: input.userId,
        reason: input.reason
      });
    },

    async suspendMessaging(input): Promise<void> {
      await client.from("message_moderation_events").insert({
        message_id: null,
        conversation_id: null,
        event_type: "user_blocked",
        actor_id: input.actorId,
        target_user_id: input.userId,
        reason: input.reason
      });
    }
  };
}
