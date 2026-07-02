import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createEventBus } from "./event-bus";
import { registerNotificationHandlers } from "./dispatcher";
import { createEmailService } from "./email-service";
import { createBroadcastService } from "./broadcast-service";
import type {
  BroadcastRecord,
  BroadcastRepository,
  CreateNotificationInput,
  EmailProvider,
  EmailRepository,
  EventRepository,
  NotificationPreferenceRepository,
  NotificationPreferences,
  NotificationRecord,
  NotificationRepository,
  OutboundEmail,
  PlatformEvent,
  QueueEmailInput
} from "./types";
import type { AdminActor } from "../audit/types";

const admin: AdminActor = { userId: "admin-1", roles: ["admin"] };
const buyer: AdminActor = { userId: "buyer-1", roles: ["buyer"] };

function createEventRepo() {
  let seq = 0;
  const written: PlatformEvent[] = [];
  const repo: EventRepository = {
    async write<TPayload extends Record<string, unknown>>(input: { eventType: PlatformEvent["eventType"]; entityType: PlatformEvent["entityType"]; entityId?: string | undefined; actorId?: string | undefined; payload: TPayload }) {
      seq += 1;
      const event: PlatformEvent<TPayload> = {
        id: `event-${seq}`,
        eventType: input.eventType,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        actorId: input.actorId ?? null,
        payload: input.payload,
        processedAt: null,
        createdAt: `2026-07-02T00:00:0${seq}.000Z`
      };
      written.push(event);
      return event;
    },
    async markProcessed() {
      /* no-op for tests */
    }
  };
  return { repo, written };
}

function createNotificationRepo() {
  const created: CreateNotificationInput[] = [];
  const repo: NotificationRepository = {
    async create(input) {
      created.push(input);
      return { ...input, id: `notif-${created.length}`, body: input.body ?? "", data: input.data ?? {}, sourceEventId: input.sourceEventId ?? null, readAt: null, archivedAt: null, createdAt: "2026-07-02T00:00:00.000Z" } as NotificationRecord;
    },
    async createMany(inputs) {
      const results: NotificationRecord[] = [];
      for (const input of inputs) {
        created.push(input);
        results.push({ ...input, id: `notif-${created.length}`, body: input.body ?? "", data: input.data ?? {}, sourceEventId: input.sourceEventId ?? null, readAt: null, archivedAt: null, createdAt: "2026-07-02T00:00:00.000Z" } as NotificationRecord);
      }
      return results;
    },
    async findById() {
      return null;
    },
    async list() {
      return { items: [], nextCursor: null };
    },
    async unreadCount() {
      return 0;
    },
    async markRead() {
      throw new Error("not used");
    },
    async markAllRead() {
      return 0;
    },
    async archive() {
      throw new Error("not used");
    }
  };
  return { repo, created };
}

function createPreferenceRepo(overrides: Partial<NotificationPreferences> = {}) {
  const repo: NotificationPreferenceRepository = {
    async get(userId) {
      return {
        userId,
        emailEnabled: true,
        inAppEnabled: true,
        marketingEmails: false,
        orderUpdates: true,
        messagingNotifications: true,
        securityNotifications: true,
        updatedAt: "2026-07-02T00:00:00.000Z",
        ...overrides
      };
    },
    async update(userId, values) {
      return { userId, emailEnabled: true, inAppEnabled: true, marketingEmails: false, orderUpdates: true, messagingNotifications: true, securityNotifications: true, updatedAt: "now", ...overrides, ...values } as NotificationPreferences;
    }
  };
  return repo;
}

function createEmailRepo() {
  const queued: QueueEmailInput[] = [];
  const repo: EmailRepository = {
    async enqueue(input) {
      queued.push(input);
      const email: OutboundEmail = {
        id: `email-${queued.length}`,
        userId: input.userId ?? null,
        toEmail: input.toEmail,
        template: input.template,
        subject: input.subject,
        payload: input.payload ?? {},
        status: "pending",
        attempts: 0,
        lastError: null,
        providerMessageId: null,
        sourceEventId: input.sourceEventId ?? null,
        createdAt: "2026-07-02T00:00:00.000Z",
        sentAt: null
      };
      return email;
    },
    async claimPending() {
      return [];
    },
    async markSent(id, providerMessageId) {
      return { id, userId: null, toEmail: "x@x.com", template: "welcome", subject: "x", payload: {}, status: "sent", attempts: 1, lastError: null, providerMessageId, sourceEventId: null, createdAt: "now", sentAt: "now" };
    },
    async markFailed(id, error) {
      return { id, userId: null, toEmail: "x@x.com", template: "welcome", subject: "x", payload: {}, status: "failed", attempts: 1, lastError: error, providerMessageId: null, sourceEventId: null, createdAt: "now", sentAt: null };
    }
  };
  return { repo, queued };
}

describe("event bus", () => {
  it("persists every published event and never lets a failing handler block others", async () => {
    const { repo: events, written } = createEventRepo();
    const calls: string[] = [];
    const bus = createEventBus({ events, onHandlerError: () => calls.push("error-handled") });

    bus.subscribe("order.created", async () => {
      throw new Error("boom");
    });
    bus.subscribe("order.created", async () => {
      calls.push("second-handler-ran");
    });

    await bus.publish({ eventType: "order.created", entityType: "order", entityId: "order-1", payload: {} });

    assert.equal(written.length, 1);
    // Handlers run concurrently, so relative ordering between the failing and succeeding
    // handler is not guaranteed -- what matters is that both ran exactly once.
    assert.deepEqual([...calls].sort(), ["error-handled", "second-handler-ran"]);
  });
});

describe("notification dispatcher", () => {
  it("creates an in-app notification and queues email when both are enabled", async () => {
    const { repo: events } = createEventRepo();
    const notifications = createNotificationRepo();
    const preferences = createPreferenceRepo();
    const { repo: emails, queued } = createEmailRepo();
    const email = createEmailService({ emails, provider: { async send() { return { providerMessageId: "x" }; } } });
    const bus = createEventBus({ events });

    registerNotificationHandlers({ bus, notifications: notifications.repo, preferences, email });

    await bus.publish({
      eventType: "seller.approved",
      entityType: "seller",
      entityId: "seller-1",
      payload: { recipientUserId: "buyer-1", recipientEmail: "buyer@example.com" }
    });

    assert.equal(notifications.created.length, 1);
    assert.equal(notifications.created[0]?.category, "seller");
    assert.equal(queued.length, 1);
    assert.equal(queued[0]?.template, "seller_approved");
  });

  it("does not queue email when the user disabled email notifications", async () => {
    const { repo: events } = createEventRepo();
    const notifications = createNotificationRepo();
    const preferences = createPreferenceRepo({ emailEnabled: false });
    const { repo: emails, queued } = createEmailRepo();
    const email = createEmailService({ emails, provider: { async send() { return { providerMessageId: "x" }; } } });
    const bus = createEventBus({ events });

    registerNotificationHandlers({ bus, notifications: notifications.repo, preferences, email });

    await bus.publish({
      eventType: "order.created",
      entityType: "order",
      entityId: "order-1",
      payload: { recipientUserId: "buyer-1", recipientEmail: "buyer@example.com" }
    });

    assert.equal(notifications.created.length, 1);
    assert.equal(queued.length, 0);
  });

  it("always delivers security-category notifications regardless of preferences", async () => {
    const { repo: events } = createEventRepo();
    const notifications = createNotificationRepo();
    const preferences = createPreferenceRepo({ emailEnabled: false, inAppEnabled: false });
    const { repo: emails, queued } = createEmailRepo();
    const email = createEmailService({ emails, provider: { async send() { return { providerMessageId: "x" }; } } });
    const bus = createEventBus({ events });

    registerNotificationHandlers({ bus, notifications: notifications.repo, preferences, email });

    await bus.publish({
      eventType: "account.status_changed",
      entityType: "user",
      entityId: "buyer-1",
      payload: { recipientUserId: "buyer-1", recipientEmail: "buyer@example.com", status: "suspended" }
    });

    assert.equal(notifications.created.length, 1);
    assert.equal(queued.length, 1);
  });

  it("skips dispatch entirely when the event has no recipientUserId", async () => {
    const { repo: events } = createEventRepo();
    const notifications = createNotificationRepo();
    const preferences = createPreferenceRepo();
    const { repo: emails, queued } = createEmailRepo();
    const email = createEmailService({ emails, provider: { async send() { return { providerMessageId: "x" }; } } });
    const bus = createEventBus({ events });

    registerNotificationHandlers({ bus, notifications: notifications.repo, preferences, email });

    await bus.publish({ eventType: "admin.announcement", entityType: "broadcast", payload: { title: "Maintenance" } });

    assert.equal(notifications.created.length, 0);
    assert.equal(queued.length, 0);
  });
});

describe("email service", () => {
  it("rejects queueing an email with an invalid address", async () => {
    const { repo } = createEmailRepo();
    const service = createEmailService({ emails: repo, provider: { async send() { return { providerMessageId: "x" }; } } });
    const result = await service.queue({ toEmail: "not-an-email", template: "welcome", subject: "Hi" });
    assert.equal(result.ok, false);
  });

  it("processes a claimed batch, marking successes sent and failures failed", async () => {
    const pending: OutboundEmail[] = [
      { id: "e1", userId: "u1", toEmail: "ok@example.com", template: "welcome", subject: "Hi", payload: {}, status: "pending", attempts: 0, lastError: null, providerMessageId: null, sourceEventId: null, createdAt: "now", sentAt: null },
      { id: "e2", userId: "u2", toEmail: "fail@example.com", template: "welcome", subject: "Hi", payload: {}, status: "pending", attempts: 0, lastError: null, providerMessageId: null, sourceEventId: null, createdAt: "now", sentAt: null }
    ];
    const sentIds: string[] = [];
    const failedIds: string[] = [];
    const repo: EmailRepository = {
      async enqueue(input) {
        return { id: "new", userId: input.userId ?? null, toEmail: input.toEmail, template: input.template, subject: input.subject, payload: input.payload ?? {}, status: "pending", attempts: 0, lastError: null, providerMessageId: null, sourceEventId: null, createdAt: "now", sentAt: null };
      },
      async claimPending() {
        return pending;
      },
      async markSent(id, providerMessageId) {
        sentIds.push(id);
        return { ...pending[0]!, id, status: "sent", providerMessageId };
      },
      async markFailed(id, error) {
        failedIds.push(id);
        return { ...pending[1]!, id, status: "failed", lastError: error };
      }
    };

    const provider: EmailProvider = {
      async send(input) {
        if (input.toEmail.includes("fail")) throw new Error("provider rejected");
        return { providerMessageId: "provider-msg-1" };
      }
    };

    const service = createEmailService({ emails: repo, provider });
    const result = await service.processQueue(10);

    assert.equal(result.sent, 1);
    assert.equal(result.failed, 1);
    assert.deepEqual(sentIds, ["e1"]);
    assert.deepEqual(failedIds, ["e2"]);
  });
});

describe("admin broadcast service", () => {
  function createBroadcastRepo() {
    const store = new Map<string, BroadcastRecord>();
    const repo: BroadcastRepository = {
      async create(actorId, input) {
        const record: BroadcastRecord = {
          id: "broadcast-1",
          createdBy: actorId,
          title: input.title,
          body: input.body,
          severity: input.severity ?? "info",
          audience: input.audience ?? "all",
          audienceFilter: input.audienceFilter ?? {},
          status: "draft",
          publishedAt: null,
          expiresAt: input.expiresAt ?? null,
          recipientCount: 0,
          createdAt: "2026-07-02T00:00:00.000Z"
        };
        store.set(record.id, record);
        return record;
      },
      async findById(id) {
        return store.get(id) ?? null;
      },
      async list() {
        return { items: [...store.values()], nextCursor: null };
      },
      async markPublished(id, recipientCount) {
        const existing = store.get(id);
        assert.ok(existing);
        const updated: BroadcastRecord = { ...existing, status: "published", publishedAt: "2026-07-02T00:01:00.000Z", recipientCount };
        store.set(id, updated);
        return updated;
      }
    };
    return repo;
  }

  it("requires notification.broadcast.manage to create or publish", async () => {
    const notifications = createNotificationRepo();
    const audits: string[] = [];
    const service = createBroadcastService({
      broadcasts: createBroadcastRepo(),
      audience: { async resolveRecipients() { return ["buyer-1", "buyer-2"]; } },
      notifications: notifications.repo,
      audit: { async writeAdminAudit(input) { audits.push(input.action); } }
    });

    const denied = await service.create(buyer, { title: "Maintenance", body: "Down for maintenance." });
    assert.equal(denied.ok, false);
  });

  it("publishes a broadcast, fanning out to every resolved recipient and writing audit records", async () => {
    const notifications = createNotificationRepo();
    const audits: string[] = [];
    const service = createBroadcastService({
      broadcasts: createBroadcastRepo(),
      audience: { async resolveRecipients() { return ["buyer-1", "buyer-2", "buyer-3"]; } },
      notifications: notifications.repo,
      audit: { async writeAdminAudit(input) { audits.push(input.action); } }
    });

    const created = await service.create(admin, { title: "Scheduled maintenance", body: "Site will be down 1am-2am.", severity: "maintenance" });
    assert.equal(created.ok, true);

    const published = await service.publish(admin, "broadcast-1");
    assert.equal(published.ok, true);
    if (published.ok) {
      assert.equal(published.data.status, "published");
      assert.equal(published.data.recipientCount, 3);
    }
    assert.equal(notifications.created.length, 3);
    assert.deepEqual(audits, ["broadcast.created", "broadcast.published"]);
  });

  it("refuses to publish an already-published broadcast", async () => {
    const notifications = createNotificationRepo();
    const service = createBroadcastService({
      broadcasts: createBroadcastRepo(),
      audience: { async resolveRecipients() { return ["buyer-1"]; } },
      notifications: notifications.repo,
      audit: { async writeAdminAudit() {} }
    });

    await service.create(admin, { title: "T", body: "B" });
    await service.publish(admin, "broadcast-1");
    const second = await service.publish(admin, "broadcast-1");
    assert.equal(second.ok, false);
    if (!second.ok) assert.equal(second.code, "BROADCAST_ALREADY_PUBLISHED");
  });
});
