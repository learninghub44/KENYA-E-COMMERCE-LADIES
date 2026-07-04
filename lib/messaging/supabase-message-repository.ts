import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CursorPage,
  MessageAttachmentRecord,
  MessageRecord,
  MessageRepository,
  PendingAttachment
} from "./types";

function toMessageAttachmentRecord(row: Record<string, unknown>): MessageAttachmentRecord {
  return {
    id: row.id as string,
    messageId: row.message_id as string,
    url: row.url as string,
    cloudinaryPublicId: row.cloudinary_public_id as string,
    mimeType: row.mime_type as string,
    width: (row.width as number | null) ?? null,
    height: (row.height as number | null) ?? null,
    bytes: (row.bytes as number | null) ?? null,
    position: (row.position as number) ?? 0,
    createdAt: row.created_at as string
  };
}

function toMessageRecord(
  row: Record<string, unknown>,
  attachments: MessageAttachmentRecord[] = []
): MessageRecord {
  return {
    id: row.id as string,
    conversationId: row.conversation_id as string,
    senderId: row.sender_id as string,
    body: (row.body as string | null) ?? null,
    replyToMessageId: (row.reply_to_message_id as string | null) ?? null,
    deliveredAt: (row.delivered_at as string | null) ?? null,
    readAt: (row.read_at as string | null) ?? null,
    editedAt: (row.edited_at as string | null) ?? null,
    deletedAt: (row.deleted_at as string | null) ?? null,
    deletedBy: (row.deleted_by as string | null) ?? null,
    createdAt: row.created_at as string,
    attachments
  };
}

function encodeCursor(value: string): string {
  return Buffer.from(value, "utf-8").toString("base64");
}

function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, "base64").toString("utf-8");
}

export function createSupabaseMessageRepository(client: SupabaseClient): MessageRepository {
  return {
    async create(input: {
      conversationId: string;
      senderId: string;
      body: string | null;
      replyToMessageId: string | null;
      attachments: PendingAttachment[];
    }): Promise<MessageRecord> {
      const { data: msgData } = await client
        .from("messages")
        .insert({
          conversation_id: input.conversationId,
          sender_id: input.senderId,
          body: input.body,
          reply_to_message_id: input.replyToMessageId
        })
        .select()
        .single();

      if (!msgData) throw new Error("Failed to create message");
      const message = msgData as Record<string, unknown>;

      let attachmentRecords: MessageAttachmentRecord[] = [];
      if (input.attachments.length > 0) {
        const { data: attData } = await client
          .from("message_attachments")
          .insert(
            input.attachments.map((a, index) => ({
              message_id: message.id as string,
              url: a.url,
              cloudinary_public_id: a.cloudinaryPublicId,
              mime_type: a.mimeType,
              width: a.width ?? null,
              height: a.height ?? null,
              bytes: a.bytes ?? null,
              position: index
            }))
          )
          .select();

        attachmentRecords = ((attData ?? []) as Record<string, unknown>[]).map(toMessageAttachmentRecord);
      }

      return toMessageRecord(message, attachmentRecords);
    },

    async findById(messageId: string): Promise<MessageRecord | null> {
      const { data } = await client
        .from("messages")
        .select("*, message_attachments(*)")
        .eq("id", messageId)
        .single();

      if (!data) return null;
      const row = data as Record<string, unknown>;
      const attachments = ((row.message_attachments ?? []) as Record<string, unknown>[]).map(toMessageAttachmentRecord);
      return toMessageRecord(row, attachments);
    },

    async listByConversation(input: { conversationId: string; cursor?: string | undefined; limit: number }): Promise<CursorPage<MessageRecord>> {
      let query = client
        .from("messages")
        .select("*, message_attachments(*)")
        .eq("conversation_id", input.conversationId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(input.limit + 1);

      if (input.cursor) {
        query = query.lt("created_at", decodeCursor(input.cursor));
      }

      const { data } = await query;
      const rows = (data ?? []) as Record<string, unknown>[];
      const hasMore = rows.length > input.limit;
      const items = rows.slice(0, input.limit).map((row) => {
        const attachments = ((row.message_attachments ?? []) as Record<string, unknown>[]).map(toMessageAttachmentRecord);
        return toMessageRecord(row, attachments);
      });
      const nextCursor = hasMore && items.length > 0
        ? encodeCursor(items[items.length - 1]!.createdAt)
        : null;

      return { items, nextCursor };
    },

    async searchByConversation(input: { conversationId: string; query: string; cursor?: string | undefined; limit: number }): Promise<CursorPage<MessageRecord>> {
      let query = client
        .from("messages")
        .select("*, message_attachments(*)")
        .eq("conversation_id", input.conversationId)
        .is("deleted_at", null)
        .ilike("body", `%${input.query}%`)
        .order("created_at", { ascending: false })
        .limit(input.limit + 1);

      if (input.cursor) {
        query = query.lt("created_at", decodeCursor(input.cursor));
      }

      const { data } = await query;
      const rows = (data ?? []) as Record<string, unknown>[];
      const hasMore = rows.length > input.limit;
      const items = rows.slice(0, input.limit).map((row) => {
        const attachments = ((row.message_attachments ?? []) as Record<string, unknown>[]).map(toMessageAttachmentRecord);
        return toMessageRecord(row, attachments);
      });
      const nextCursor = hasMore && items.length > 0
        ? encodeCursor(items[items.length - 1]!.createdAt)
        : null;

      return { items, nextCursor };
    },

    async editBody(input: { messageId: string; body: string; editedAt: string }): Promise<MessageRecord> {
      const { data } = await client
        .from("messages")
        .update({ body: input.body, edited_at: input.editedAt })
        .eq("id", input.messageId)
        .select("*, message_attachments(*)")
        .single();

      if (!data) throw new Error("Message not found");
      const row = data as Record<string, unknown>;
      const attachments = ((row.message_attachments ?? []) as Record<string, unknown>[]).map(toMessageAttachmentRecord);
      return toMessageRecord(row, attachments);
    },

    async softDelete(input: { messageId: string; deletedBy: string; deletedAt: string }): Promise<MessageRecord> {
      const { data } = await client
        .from("messages")
        .update({ deleted_at: input.deletedAt, deleted_by: input.deletedBy })
        .eq("id", input.messageId)
        .select("*, message_attachments(*)")
        .single();

      if (!data) throw new Error("Message not found");
      const row = data as Record<string, unknown>;
      const attachments = ((row.message_attachments ?? []) as Record<string, unknown>[]).map(toMessageAttachmentRecord);
      return toMessageRecord(row, attachments);
    },

    async markDelivered(input: { conversationId: string; recipientId: string; deliveredAt: string }): Promise<number> {
      const { data: messages } = await client
        .from("messages")
        .select("id")
        .eq("conversation_id", input.conversationId)
        .neq("sender_id", input.recipientId)
        .is("delivered_at", null);

      const ids = ((messages ?? []) as Record<string, unknown>[]).map((m) => m.id as string);
      if (ids.length === 0) return 0;

      const { error } = await client
        .from("messages")
        .update({ delivered_at: input.deliveredAt })
        .in("id", ids);

      return error ? 0 : ids.length;
    },

    async markRead(input: { conversationId: string; recipientId: string; readAt: string }): Promise<number> {
      const { data: messages } = await client
        .from("messages")
        .select("id")
        .eq("conversation_id", input.conversationId)
        .neq("sender_id", input.recipientId)
        .not("delivered_at", "is", null)
        .is("read_at", null);

      const ids = ((messages ?? []) as Record<string, unknown>[]).map((m) => m.id as string);
      if (ids.length === 0) return 0;

      const { error } = await client
        .from("messages")
        .update({ read_at: input.readAt })
        .in("id", ids);

      return error ? 0 : ids.length;
    }
  };
}
