import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createModerationService, type MessageModerationRecord } from "./index";
import type { AdminActor } from "../audit/index";

const moderator: AdminActor = { userId: "mod-1", roles: ["moderator"] };
const support: AdminActor = { userId: "support-1", roles: ["support"] };

describe("moderation service", () => {
  it("deletes reported messages and writes audit records", async () => {
    let message: MessageModerationRecord = {
      id: "message-1",
      conversationId: "conversation-1",
      senderId: "buyer-1",
      body: "Bad content",
      deletedAt: null,
      reportCount: 2,
      createdAt: "2026-07-02T00:00:00.000Z"
    };
    const audits: string[] = [];
    const service = createModerationService({
      moderation: {
        async queue() {
          return { items: [], nextCursor: null };
        },
        async reportedMessages() {
          return { items: [message], nextCursor: null };
        }
      },
      messages: {
        async findById(id) {
          return id === message.id ? message : null;
        },
        async softDelete() {
          message = { ...message, deletedAt: "2026-07-02T00:01:00.000Z" };
          return message;
        },
        async warnUser() {},
        async suspendMessaging() {}
      },
      audit: {
        async writeAdminAudit(input) {
          audits.push(input.action);
        }
      }
    });

    const result = await service.deleteMessage(moderator, "message-1", "Harassment");
    assert.equal(result.ok, true);
    assert.equal(message.deletedAt, "2026-07-02T00:01:00.000Z");
    assert.deepEqual(audits, ["message.deleted_by_moderator"]);
  });

  it("blocks support users from moderation actions without admin.moderate", async () => {
    const service = createModerationService({
      moderation: {
        async queue() {
          return { items: [], nextCursor: null };
        },
        async reportedMessages() {
          return { items: [], nextCursor: null };
        }
      },
      messages: {
        async findById() {
          return null;
        },
        async softDelete() {
          throw new Error("should not run");
        },
        async warnUser() {},
        async suspendMessaging() {}
      },
      audit: { async writeAdminAudit() {} }
    });

    const result = await service.warnUser(support, "buyer-1", "Policy reminder");
    assert.equal(result.ok, false);
  });
});
