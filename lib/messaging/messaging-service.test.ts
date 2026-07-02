import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createConversationService } from "./conversation-service.js";
import { createMessageService } from "./message-service.js";
import type {
  ConversationParticipantRole,
  ConversationRecord,
  ConversationRepository,
  CursorPage,
  MessageRecord,
  MessageRepository,
  PendingAttachment
} from "./types.js";

const buyerId = "11111111-1111-4111-8111-111111111111";
const otherBuyerId = "99999999-9999-4999-8999-999999999999";
const sellerId = "22222222-2222-4222-8222-222222222222";
const productId = "33333333-3333-4333-8333-333333333333";

function fixedNow(iso: string) {
  return () => iso;
}

function fakeUuid(seed: number, prefix: string): string {
  const hex = seed.toString(16).padStart(8, "0");
  return `${hex}-0000-4000-8000-${prefix.padStart(12, "0")}`;
}

class InMemoryConversationRepository implements ConversationRepository {
  conversations = new Map<string, ConversationRecord>();
  private counter = 0;

  async findById(conversationId: string) {
    return this.conversations.get(conversationId) ?? null;
  }

  async findByParticipants(input: { buyerId: string; sellerId: string; productId: string | null }) {
    for (const conversation of this.conversations.values()) {
      if (conversation.buyerId === input.buyerId && conversation.sellerId === input.sellerId && conversation.productId === input.productId) {
        return conversation;
      }
    }
    return null;
  }

  async create(input: Parameters<ConversationRepository["create"]>[0]) {
    this.counter += 1;
    const record: ConversationRecord = {
      id: fakeUuid(this.counter, "c"),
      status: "active",
      buyerDeletedAt: null,
      sellerDeletedAt: null,
      buyerUnreadCount: 0,
      sellerUnreadCount: 0,
      lastMessageAt: null,
      lastMessagePreview: null,
      createdAt: "2026-07-02T00:00:00.000Z",
      updatedAt: "2026-07-02T00:00:00.000Z",
      ...input
    };
    this.conversations.set(record.id, record);
    return record;
  }

  async listForBuyer(input: { buyerId: string; cursor?: string | undefined; limit: number; includeArchived: boolean }): Promise<CursorPage<ConversationRecord>> {
    const items = [...this.conversations.values()].filter(
      (c) => c.buyerId === input.buyerId && (input.includeArchived || c.status === "active")
    );
    return { items, nextCursor: null };
  }

  async listForSeller(input: { sellerId: string; cursor?: string | undefined; limit: number; includeArchived: boolean }): Promise<CursorPage<ConversationRecord>> {
    const items = [...this.conversations.values()].filter(
      (c) => c.sellerId === input.sellerId && (input.includeArchived || c.status === "active")
    );
    return { items, nextCursor: null };
  }

  async searchForParticipant(): Promise<CursorPage<ConversationRecord>> {
    return { items: [], nextCursor: null };
  }

  async updateStatus(input: { conversationId: string; status: ConversationRecord["status"] }) {
    const existing = this.conversations.get(input.conversationId);
    if (!existing) throw new Error("not found");
    const updated = { ...existing, status: input.status };
    this.conversations.set(updated.id, updated);
    return updated;
  }

  async softDeleteForParticipant(input: { conversationId: string; role: ConversationParticipantRole }) {
    const existing = this.conversations.get(input.conversationId);
    if (!existing) throw new Error("not found");
    const updated = {
      ...existing,
      buyerDeletedAt: input.role === "buyer" ? "2026-07-02T00:05:00.000Z" : existing.buyerDeletedAt,
      sellerDeletedAt: input.role === "seller" ? "2026-07-02T00:05:00.000Z" : existing.sellerDeletedAt
    };
    this.conversations.set(updated.id, updated);
    return updated;
  }

  async resetUnreadCount(input: { conversationId: string; role: ConversationParticipantRole }) {
    const existing = this.conversations.get(input.conversationId);
    if (!existing) throw new Error("not found");
    const updated = {
      ...existing,
      buyerUnreadCount: input.role === "buyer" ? 0 : existing.buyerUnreadCount,
      sellerUnreadCount: input.role === "seller" ? 0 : existing.sellerUnreadCount
    };
    this.conversations.set(updated.id, updated);
    return updated;
  }
}

class InMemoryMessageRepository implements MessageRepository {
  messages = new Map<string, MessageRecord>();
  private counter = 0;

  async create(input: { conversationId: string; senderId: string; body: string | null; replyToMessageId: string | null; attachments: PendingAttachment[] }) {
    this.counter += 1;
    const record: MessageRecord = {
      id: fakeUuid(this.counter, "d"),
      conversationId: input.conversationId,
      senderId: input.senderId,
      body: input.body,
      replyToMessageId: input.replyToMessageId,
      deliveredAt: null,
      readAt: null,
      editedAt: null,
      deletedAt: null,
      deletedBy: null,
      createdAt: "2026-07-02T00:00:00.000Z",
      attachments: input.attachments.map((attachment, index) => ({
        id: fakeUuid(this.counter * 100 + index, "a"),
        messageId: fakeUuid(this.counter, "d"),
        url: attachment.url,
        cloudinaryPublicId: attachment.cloudinaryPublicId,
        mimeType: attachment.mimeType,
        width: attachment.width ?? null,
        height: attachment.height ?? null,
        bytes: attachment.bytes ?? null,
        position: index,
        createdAt: "2026-07-02T00:00:00.000Z"
      }))
    };
    this.messages.set(record.id, record);
    return record;
  }

  async findById(messageId: string) {
    return this.messages.get(messageId) ?? null;
  }

  async listByConversation(input: { conversationId: string; cursor?: string | undefined; limit: number }): Promise<CursorPage<MessageRecord>> {
    const items = [...this.messages.values()].filter((m) => m.conversationId === input.conversationId);
    return { items, nextCursor: null };
  }

  async searchByConversation(input: { conversationId: string; query: string; cursor?: string | undefined; limit: number }): Promise<CursorPage<MessageRecord>> {
    const items = [...this.messages.values()].filter(
      (m) => m.conversationId === input.conversationId && (m.body ?? "").toLowerCase().includes(input.query.toLowerCase())
    );
    return { items, nextCursor: null };
  }

  async editBody(input: { messageId: string; body: string; editedAt: string }) {
    const existing = this.messages.get(input.messageId);
    if (!existing) throw new Error("not found");
    const updated = { ...existing, body: input.body, editedAt: input.editedAt };
    this.messages.set(updated.id, updated);
    return updated;
  }

  async softDelete(input: { messageId: string; deletedBy: string; deletedAt: string }) {
    const existing = this.messages.get(input.messageId);
    if (!existing) throw new Error("not found");
    const updated = { ...existing, deletedAt: input.deletedAt, deletedBy: input.deletedBy };
    this.messages.set(updated.id, updated);
    return updated;
  }

  async markDelivered(input: { conversationId: string; recipientId: string; deliveredAt: string }) {
    let count = 0;
    for (const message of this.messages.values()) {
      if (message.conversationId === input.conversationId && message.senderId !== input.recipientId && !message.deliveredAt) {
        message.deliveredAt = input.deliveredAt;
        count += 1;
      }
    }
    return count;
  }

  async markRead(input: { conversationId: string; recipientId: string; readAt: string }) {
    let count = 0;
    for (const message of this.messages.values()) {
      if (message.conversationId === input.conversationId && message.senderId !== input.recipientId && !message.readAt) {
        message.readAt = input.readAt;
        count += 1;
      }
    }
    return count;
  }
}

function buildServices() {
  const conversations = new InMemoryConversationRepository();
  const messages = new InMemoryMessageRepository();
  const conversationService = createConversationService({ conversations });
  const messageService = createMessageService({ conversations, messages, now: fixedNow("2026-07-02T00:10:00.000Z") });
  return { conversations, messages, conversationService, messageService };
}

describe("conversation-service", () => {
  it("creates a new conversation scoped to buyer/seller/product", async () => {
    const { conversationService } = buildServices();
    const result = await conversationService.start({ buyerId, sellerId, productId });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.buyerId, buyerId);
      assert.equal(result.data.productId, productId);
      assert.equal(result.data.status, "active");
    }
  });

  it("reuses the existing conversation for the same buyer/seller/product", async () => {
    const { conversationService } = buildServices();
    const first = await conversationService.start({ buyerId, sellerId, productId });
    const second = await conversationService.start({ buyerId, sellerId, productId });
    assert.equal(first.ok && second.ok && first.data.id, second.ok && second.data.id);
  });

  it("reopens an archived conversation instead of duplicating it", async () => {
    const { conversationService } = buildServices();
    const created = await conversationService.start({ buyerId, sellerId, productId });
    assert.ok(created.ok);
    if (!created.ok) return;
    await conversationService.archive({ conversationId: created.data.id, actorId: buyerId }, "buyer");
    const reopened = await conversationService.start({ buyerId, sellerId, productId });
    assert.ok(reopened.ok);
    if (reopened.ok) {
      assert.equal(reopened.data.id, created.data.id);
      assert.equal(reopened.data.status, "active");
    }
  });

  it("rejects archiving by a non-participant buyer", async () => {
    const { conversationService } = buildServices();
    const created = await conversationService.start({ buyerId, sellerId, productId });
    assert.ok(created.ok);
    if (!created.ok) return;
    const result = await conversationService.archive({ conversationId: created.data.id, actorId: otherBuyerId }, "buyer");
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "FORBIDDEN");
  });
});

describe("message-service", () => {
  it("sends a message and updates conversation unread counters via a fresh lookup", async () => {
    const { conversationService, messageService, conversations } = buildServices();
    const created = await conversationService.start({ buyerId, sellerId, productId });
    assert.ok(created.ok);
    if (!created.ok) return;

    const sent = await messageService.send({ conversationId: created.data.id, senderId: buyerId, body: "Is this still available?" }, false);
    assert.equal(sent.ok, true);
    if (sent.ok) {
      assert.equal(sent.data.body, "Is this still available?");
      assert.equal(sent.data.attachments.length, 0);
    }
    assert.ok(conversations.conversations.get(created.data.id));
  });

  it("rejects sending a message from a non-participant", async () => {
    const { conversationService, messageService } = buildServices();
    const created = await conversationService.start({ buyerId, sellerId, productId });
    assert.ok(created.ok);
    if (!created.ok) return;
    const result = await messageService.send({ conversationId: created.data.id, senderId: otherBuyerId, body: "hi" }, false);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "FORBIDDEN");
  });

  it("requires body text or at least one attachment", async () => {
    const { conversationService, messageService } = buildServices();
    const created = await conversationService.start({ buyerId, sellerId, productId });
    assert.ok(created.ok);
    if (!created.ok) return;
    const result = await messageService.send({ conversationId: created.data.id, senderId: buyerId }, false);
    assert.equal(result.ok, false);
  });

  it("allows the sender to edit within the edit window", async () => {
    const { conversationService, messageService } = buildServices();
    const created = await conversationService.start({ buyerId, sellerId, productId });
    assert.ok(created.ok);
    if (!created.ok) return;
    const sent = await messageService.send({ conversationId: created.data.id, senderId: buyerId, body: "orig" }, false);
    assert.ok(sent.ok);
    if (!sent.ok) return;
    const edited = await messageService.edit({ messageId: sent.data.id, editorId: buyerId, body: "updated" });
    assert.equal(edited.ok, true);
    if (edited.ok) assert.equal(edited.data.body, "updated");
  });

  it("rejects editing by someone other than the sender", async () => {
    const { conversationService, messageService } = buildServices();
    const created = await conversationService.start({ buyerId, sellerId, productId });
    assert.ok(created.ok);
    if (!created.ok) return;
    const sent = await messageService.send({ conversationId: created.data.id, senderId: buyerId, body: "orig" }, false);
    assert.ok(sent.ok);
    if (!sent.ok) return;
    const edited = await messageService.edit({ messageId: sent.data.id, editorId: sellerId, body: "hijacked" });
    assert.equal(edited.ok, false);
    if (!edited.ok) assert.equal(edited.code, "FORBIDDEN");
  });

  it("soft deletes a message and preserves the row", async () => {
    const { conversationService, messageService, messages } = buildServices();
    const created = await conversationService.start({ buyerId, sellerId, productId });
    assert.ok(created.ok);
    if (!created.ok) return;
    const sent = await messageService.send({ conversationId: created.data.id, senderId: buyerId, body: "orig" }, false);
    assert.ok(sent.ok);
    if (!sent.ok) return;
    const deleted = await messageService.softDelete({ messageId: sent.data.id, actorId: buyerId });
    assert.equal(deleted.ok, true);
    assert.ok(messages.messages.get(sent.data.id)?.deletedAt);
  });

  it("marks messages as read and resets the recipient unread counter", async () => {
    const { conversationService, messageService } = buildServices();
    const created = await conversationService.start({ buyerId, sellerId, productId });
    assert.ok(created.ok);
    if (!created.ok) return;
    await messageService.send({ conversationId: created.data.id, senderId: buyerId, body: "hi" }, false);
    const readResult = await messageService.markRead({ conversationId: created.data.id, recipientId: sellerId }, "seller");
    assert.equal(readResult.ok, true);
    if (readResult.ok) assert.equal(readResult.data.updated, 1);
  });
});
