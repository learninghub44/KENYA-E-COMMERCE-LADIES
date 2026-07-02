import { MESSAGE_EDIT_WINDOW_MINUTES } from "./schemas";
import { deleteMessageSchema, editMessageSchema, markReadSchema, reportMessageSchema, sendMessageSchema } from "./schemas";
import type {
  ConversationParticipantRole,
  ConversationRepository,
  CursorPage,
  MessageRecord,
  MessageRepository,
  MessagingEventPublisher,
  MessagingResult,
  ModerationEventPublisher
} from "./types";

export type MessageServiceDependencies = {
  messages: MessageRepository;
  conversations: ConversationRepository;
  events?: MessagingEventPublisher | undefined;
  moderation?: ModerationEventPublisher | undefined;
  now?: () => string;
};

function failure(code: string, message: string, status: number): MessagingResult<never> {
  return { ok: false, code, message, status };
}

function isParticipant(buyerId: string, sellerAllowed: boolean, participantId: string): boolean {
  return participantId === buyerId || sellerAllowed;
}

export function createMessageService(deps: MessageServiceDependencies) {
  const now = deps.now ?? (() => new Date().toISOString());

  return {
    /**
     * Sends a message into a conversation. Caller must have already verified the sender
     * is a participant (buyer id match, or seller management permission).
     */
    async send(input: unknown, senderIsSeller: boolean): Promise<MessagingResult<MessageRecord>> {
      const parsed = sendMessageSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Message input is invalid.", 400);

      const conversation = await deps.conversations.findById(parsed.data.conversationId);
      if (!conversation) return failure("NOT_FOUND", "Conversation not found.", 404);
      if (!isParticipant(conversation.buyerId, senderIsSeller, parsed.data.senderId)) {
        return failure("FORBIDDEN", "You are not a participant in this conversation.", 403);
      }

      if (parsed.data.replyToMessageId) {
        const replyTarget = await deps.messages.findById(parsed.data.replyToMessageId);
        if (!replyTarget || replyTarget.conversationId !== conversation.id) {
          return failure("VALIDATION_ERROR", "The message being replied to does not exist in this conversation.", 400);
        }
      }

      const created = await deps.messages.create({
        conversationId: conversation.id,
        senderId: parsed.data.senderId,
        body: parsed.data.body ?? null,
        replyToMessageId: parsed.data.replyToMessageId ?? null,
        attachments: parsed.data.attachments ?? []
      });

      await deps.events?.publish({
        type: "message.new",
        conversationId: conversation.id,
        messageId: created.id,
        buyerId: conversation.buyerId,
        sellerId: conversation.sellerId
      });

      return { ok: true, data: created };
    },

    async listByConversation(conversationId: string, participantId: string, senderIsSeller: boolean, cursor: string | undefined, limit = 30): Promise<MessagingResult<CursorPage<MessageRecord>>> {
      const conversation = await deps.conversations.findById(conversationId);
      if (!conversation) return failure("NOT_FOUND", "Conversation not found.", 404);
      if (!isParticipant(conversation.buyerId, senderIsSeller, participantId)) {
        return failure("FORBIDDEN", "You are not a participant in this conversation.", 403);
      }
      return { ok: true, data: await deps.messages.listByConversation({ conversationId, cursor, limit }) };
    },

    async searchByConversation(conversationId: string, participantId: string, senderIsSeller: boolean, query: string, cursor: string | undefined, limit = 30): Promise<MessagingResult<CursorPage<MessageRecord>>> {
      const conversation = await deps.conversations.findById(conversationId);
      if (!conversation) return failure("NOT_FOUND", "Conversation not found.", 404);
      if (!isParticipant(conversation.buyerId, senderIsSeller, participantId)) {
        return failure("FORBIDDEN", "You are not a participant in this conversation.", 403);
      }
      return { ok: true, data: await deps.messages.searchByConversation({ conversationId, query, cursor, limit }) };
    },

    /**
     * Edits a message body within the configurable edit window. Attachments cannot be
     * changed after send; edited messages are timestamped with editedAt.
     */
    async edit(input: unknown): Promise<MessagingResult<MessageRecord>> {
      const parsed = editMessageSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Edit input is invalid.", 400);

      const message = await deps.messages.findById(parsed.data.messageId);
      if (!message) return failure("NOT_FOUND", "Message not found.", 404);
      if (message.deletedAt) return failure("MESSAGE_DELETED", "This message has been deleted and cannot be edited.", 409);
      if (message.senderId !== parsed.data.editorId) return failure("FORBIDDEN", "You may only edit your own messages.", 403);

      const ageMinutes = (Date.parse(now()) - Date.parse(message.createdAt)) / 60000;
      if (ageMinutes > MESSAGE_EDIT_WINDOW_MINUTES) {
        return failure("EDIT_WINDOW_EXPIRED", `Messages can only be edited within ${MESSAGE_EDIT_WINDOW_MINUTES} minutes of sending.`, 409);
      }

      const updated = await deps.messages.editBody({ messageId: message.id, body: parsed.data.body, editedAt: now() });
      return { ok: true, data: updated };
    },

    /**
     * Soft-deletes a message. Only the sender or staff may delete; the row is retained
     * with deletedAt set so conversation history stays consistent.
     */
    async softDelete(input: unknown, actorIsStaff = false): Promise<MessagingResult<MessageRecord>> {
      const parsed = deleteMessageSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Delete input is invalid.", 400);

      const message = await deps.messages.findById(parsed.data.messageId);
      if (!message) return failure("NOT_FOUND", "Message not found.", 404);
      if (message.senderId !== parsed.data.actorId && !actorIsStaff) {
        return failure("FORBIDDEN", "You may only delete your own messages.", 403);
      }
      if (message.deletedAt) return { ok: true, data: message };

      const updated = await deps.messages.softDelete({ messageId: message.id, deletedBy: parsed.data.actorId, deletedAt: now() });

      await deps.moderation?.record({
        eventType: "deleted",
        messageId: message.id,
        conversationId: message.conversationId,
        actorId: parsed.data.actorId
      });

      const conversation = await deps.conversations.findById(message.conversationId);
      if (conversation) {
        await deps.events?.publish({
          type: "message.deleted",
          conversationId: conversation.id,
          messageId: message.id,
          buyerId: conversation.buyerId,
          sellerId: conversation.sellerId
        });
      }

      return { ok: true, data: updated };
    },

    /**
     * Marks all unread messages in a conversation as read for the given recipient and
     * resets that participant's unread counter.
     */
    async markRead(input: unknown, role: ConversationParticipantRole): Promise<MessagingResult<{ updated: number }>> {
      const parsed = markReadSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Mark-read input is invalid.", 400);

      const conversation = await deps.conversations.findById(parsed.data.conversationId);
      if (!conversation) return failure("NOT_FOUND", "Conversation not found.", 404);
      if (role === "buyer" && conversation.buyerId !== parsed.data.recipientId) {
        return failure("FORBIDDEN", "You are not a participant in this conversation.", 403);
      }

      const updated = await deps.messages.markRead({ conversationId: conversation.id, recipientId: parsed.data.recipientId, readAt: now() });
      await deps.conversations.resetUnreadCount({ conversationId: conversation.id, role });

      await deps.events?.publish({
        type: "message.read",
        conversationId: conversation.id,
        buyerId: conversation.buyerId,
        sellerId: conversation.sellerId,
        metadata: { readerRole: role }
      });

      return { ok: true, data: { updated } };
    },

    async markDelivered(conversationId: string, recipientId: string): Promise<MessagingResult<{ updated: number }>> {
      const updated = await deps.messages.markDelivered({ conversationId, recipientId, deliveredAt: now() });
      return { ok: true, data: { updated } };
    },

    /**
     * Records a report against a message. Does not delete or hide the message; that is
     * a decision for a future moderation agent.
     */
    async report(input: unknown): Promise<MessagingResult<{ reported: true }>> {
      const parsed = reportMessageSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Report input is invalid.", 400);

      const message = await deps.messages.findById(parsed.data.messageId);
      if (!message) return failure("NOT_FOUND", "Message not found.", 404);

      await deps.moderation?.record({
        eventType: "reported",
        messageId: message.id,
        conversationId: message.conversationId,
        actorId: parsed.data.actorId,
        targetUserId: message.senderId,
        reason: parsed.data.reason
      });

      return { ok: true, data: { reported: true } };
    }
  };
}
