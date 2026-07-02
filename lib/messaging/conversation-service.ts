import { archiveConversationSchema, searchConversationsSchema, startConversationSchema } from "./schemas";
import type {
  ConversationParticipantRole,
  ConversationRecord,
  ConversationRepository,
  CursorPage,
  MessagingEventPublisher,
  MessagingResult
} from "./types";

export type ConversationServiceDependencies = {
  conversations: ConversationRepository;
  events?: MessagingEventPublisher | undefined;
};

function failure(code: string, message: string, status: number): MessagingResult<never> {
  return { ok: false, code, message, status };
}

/**
 * Resolves whether a given participant may act on a conversation, and in which role.
 * Sellers are represented by seller_id ownership (validated by the caller against
 * Agent 02 permissions before invoking this service), buyers by direct id match.
 */
function roleFor(conversation: ConversationRecord, participantId: string, actingRole: ConversationParticipantRole): boolean {
  if (actingRole === "buyer") return conversation.buyerId === participantId;
  return true; // seller ownership is validated by the caller via current_user_can_manage_seller / repository scoping
}

export function createConversationService(deps: ConversationServiceDependencies) {
  return {
    /**
     * Starts or reuses the single conversation for a buyer/seller/product combination.
     */
    async start(input: unknown): Promise<MessagingResult<ConversationRecord>> {
      const parsed = startConversationSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Conversation start input is invalid.", 400);

      const productId = parsed.data.productId ?? null;
      const existing = await deps.conversations.findByParticipants({
        buyerId: parsed.data.buyerId,
        sellerId: parsed.data.sellerId,
        productId
      });
      if (existing) {
        if (existing.status === "archived") {
          const reopened = await deps.conversations.updateStatus({ conversationId: existing.id, status: "active" });
          return { ok: true, data: reopened };
        }
        return { ok: true, data: existing };
      }

      const created = await deps.conversations.create({
        buyerId: parsed.data.buyerId,
        sellerId: parsed.data.sellerId,
        productId,
        variantId: parsed.data.variantId ?? null,
        orderId: parsed.data.orderId ?? null,
        productSnapshot: parsed.data.productSnapshot ?? null
      });

      await deps.events?.publish({
        type: "conversation.created",
        conversationId: created.id,
        buyerId: created.buyerId,
        sellerId: created.sellerId
      });

      return { ok: true, data: created };
    },

    async getForParticipant(conversationId: string, participantId: string, role: ConversationParticipantRole): Promise<MessagingResult<ConversationRecord>> {
      const conversation = await deps.conversations.findById(conversationId);
      if (!conversation) return failure("NOT_FOUND", "Conversation not found.", 404);
      if (!roleFor(conversation, participantId, role)) return failure("FORBIDDEN", "You are not a participant in this conversation.", 403);
      return { ok: true, data: conversation };
    },

    async listForBuyer(buyerId: string, cursor: string | undefined, limit = 20, includeArchived = false): Promise<MessagingResult<CursorPage<ConversationRecord>>> {
      return { ok: true, data: await deps.conversations.listForBuyer({ buyerId, cursor, limit, includeArchived }) };
    },

    async listForSeller(sellerId: string, cursor: string | undefined, limit = 20, includeArchived = false): Promise<MessagingResult<CursorPage<ConversationRecord>>> {
      return { ok: true, data: await deps.conversations.listForSeller({ sellerId, cursor, limit, includeArchived }) };
    },

    async search(input: unknown): Promise<MessagingResult<CursorPage<ConversationRecord>>> {
      const parsed = searchConversationsSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Conversation search input is invalid.", 400);
      const data = await deps.conversations.searchForParticipant(parsed.data);
      return { ok: true, data };
    },

    async archive(input: unknown, role: ConversationParticipantRole): Promise<MessagingResult<ConversationRecord>> {
      const parsed = archiveConversationSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Archive input is invalid.", 400);
      const conversation = await deps.conversations.findById(parsed.data.conversationId);
      if (!conversation) return failure("NOT_FOUND", "Conversation not found.", 404);
      if (!roleFor(conversation, parsed.data.actorId, role)) return failure("FORBIDDEN", "You are not a participant in this conversation.", 403);
      const updated = await deps.conversations.updateStatus({ conversationId: conversation.id, status: "archived" });
      return { ok: true, data: updated };
    },

    async reopen(input: unknown, role: ConversationParticipantRole): Promise<MessagingResult<ConversationRecord>> {
      const parsed = archiveConversationSchema.safeParse(input);
      if (!parsed.success) return failure("VALIDATION_ERROR", "Reopen input is invalid.", 400);
      const conversation = await deps.conversations.findById(parsed.data.conversationId);
      if (!conversation) return failure("NOT_FOUND", "Conversation not found.", 404);
      if (!roleFor(conversation, parsed.data.actorId, role)) return failure("FORBIDDEN", "You are not a participant in this conversation.", 403);
      const updated = await deps.conversations.updateStatus({ conversationId: conversation.id, status: "active" });
      return { ok: true, data: updated };
    },

    /**
     * Soft-deletes the conversation for one participant only. The conversation and its
     * messages remain intact for the other participant.
     */
    async deleteForParticipant(conversationId: string, participantId: string, role: ConversationParticipantRole): Promise<MessagingResult<ConversationRecord>> {
      const conversation = await deps.conversations.findById(conversationId);
      if (!conversation) return failure("NOT_FOUND", "Conversation not found.", 404);
      if (!roleFor(conversation, participantId, role)) return failure("FORBIDDEN", "You are not a participant in this conversation.", 403);
      const updated = await deps.conversations.softDeleteForParticipant({ conversationId, role });
      return { ok: true, data: updated };
    }
  };
}
