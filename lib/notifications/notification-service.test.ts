import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createNotificationService } from "./notification-service.js";
import { createPreferenceService } from "./preference-service.js";
import type {
  CreateNotificationInput,
  NotificationPreferenceRepository,
  NotificationPreferences,
  NotificationRecord,
  NotificationRepository
} from "./types.js";
import type { AdminActor } from "../audit/types.js";

const buyer: AdminActor = { userId: "buyer-1", roles: ["buyer"] };
const otherBuyer: AdminActor = { userId: "buyer-2", roles: ["buyer"] };
const support: AdminActor = { userId: "agent-1", roles: ["support"] };

function createRepo() {
  const records = new Map<string, NotificationRecord>();
  let seq = 0;

  function make(input: CreateNotificationInput): NotificationRecord {
    seq += 1;
    return {
      id: `notif-${seq}`,
      userId: input.userId,
      category: input.category,
      type: input.type,
      title: input.title,
      body: input.body ?? "",
      data: input.data ?? {},
      sourceEventId: input.sourceEventId ?? null,
      readAt: null,
      archivedAt: null,
      createdAt: `2026-07-02T00:00:0${seq}.000Z`
    };
  }

  const repo: NotificationRepository = {
    async create(input) {
      const record = make(input);
      records.set(record.id, record);
      return record;
    },
    async createMany(inputs) {
      return inputs.map((input) => {
        const record = make(input);
        records.set(record.id, record);
        return record;
      });
    },
    async findById(id) {
      return records.get(id) ?? null;
    },
    async list(userId, filters) {
      let items = [...records.values()].filter((r) => r.userId === userId);
      if (!filters.includeArchived) items = items.filter((r) => !r.archivedAt);
      if (filters.unreadOnly) items = items.filter((r) => !r.readAt);
      if (filters.category) items = items.filter((r) => r.category === filters.category);
      return { items, nextCursor: null };
    },
    async unreadCount(userId) {
      return [...records.values()].filter((r) => r.userId === userId && !r.readAt && !r.archivedAt).length;
    },
    async markRead(id) {
      const existing = records.get(id);
      assert.ok(existing);
      const updated = { ...existing, readAt: "2026-07-02T00:05:00.000Z" };
      records.set(id, updated);
      return updated;
    },
    async markAllRead(userId) {
      let count = 0;
      for (const [id, record] of records) {
        if (record.userId === userId && !record.readAt) {
          records.set(id, { ...record, readAt: "2026-07-02T00:05:00.000Z" });
          count += 1;
        }
      }
      return count;
    },
    async archive(id) {
      const existing = records.get(id);
      assert.ok(existing);
      const updated = { ...existing, archivedAt: "2026-07-02T00:06:00.000Z" };
      records.set(id, updated);
      return updated;
    }
  };

  return { records, service: createNotificationService({ notifications: repo }) };
}

describe("notification service", () => {
  it("lets a user list, count, and read their own notifications", async () => {
    const { service } = createRepo();
    await service.create({ userId: "buyer-1", category: "orders", type: "order.created", title: "Order placed" });
    await service.create({ userId: "buyer-1", category: "messaging", type: "message.created", title: "New message" });

    const unread = await service.unreadCount(buyer);
    assert.equal(unread.ok, true);
    if (unread.ok) assert.equal(unread.data, 2);

    const listed = await service.list(buyer, {});
    assert.equal(listed.ok, true);
    if (listed.ok) assert.equal(listed.data.items.length, 2);
  });

  it("prevents a user from reading another user's notifications", async () => {
    const { service } = createRepo();
    const created = await service.create({ userId: "buyer-1", category: "orders", type: "order.created", title: "Order placed" });

    const readResult = await service.markAsRead(otherBuyer, created.id);
    assert.equal(readResult.ok, false);
    if (!readResult.ok) assert.equal(readResult.code, "AUTHORIZATION_DENIED");
  });

  it("allows support staff to act on a user's notification for investigations", async () => {
    const { service } = createRepo();
    const created = await service.create({ userId: "buyer-1", category: "orders", type: "order.created", title: "Order placed" });

    const result = await service.markAsRead(support, created.id);
    assert.equal(result.ok, true);
  });

  it("marks a single notification read and bulk marks all as read", async () => {
    const { service } = createRepo();
    const a = await service.create({ userId: "buyer-1", category: "orders", type: "order.created", title: "A" });
    await service.create({ userId: "buyer-1", category: "orders", type: "order.created", title: "B" });

    const single = await service.markAsRead(buyer, a.id);
    assert.equal(single.ok, true);
    if (single.ok) assert.ok(single.data.readAt);

    const bulk = await service.markAllAsRead(buyer);
    assert.equal(bulk.ok, true);
    if (bulk.ok) assert.equal(bulk.data.updated, 1);

    const unread = await service.unreadCount(buyer);
    if (unread.ok) assert.equal(unread.data, 0);
  });

  it("archives (soft-deletes) a notification and excludes it from default listing", async () => {
    const { service } = createRepo();
    const created = await service.create({ userId: "buyer-1", category: "orders", type: "order.created", title: "A" });

    const archived = await service.archive(buyer, created.id);
    assert.equal(archived.ok, true);
    if (archived.ok) assert.ok(archived.data.archivedAt);

    const listed = await service.list(buyer, {});
    if (listed.ok) assert.equal(listed.data.items.length, 0);

    const withArchived = await service.list(buyer, { includeArchived: true });
    if (withArchived.ok) assert.equal(withArchived.data.items.length, 1);
  });

  it("rejects operations for actors without notification.read.own", async () => {
    const { service } = createRepo();
    const guest: AdminActor = { userId: "unknown", roles: [] };
    const result = await service.list(guest, {});
    assert.equal(result.ok, false);
  });
});

function createPreferenceRepo() {
  const store = new Map<string, NotificationPreferences>();

  function defaults(userId: string): NotificationPreferences {
    return {
      userId,
      emailEnabled: true,
      inAppEnabled: true,
      marketingEmails: false,
      orderUpdates: true,
      messagingNotifications: true,
      securityNotifications: true,
      updatedAt: "2026-07-02T00:00:00.000Z"
    };
  }

  const repo: NotificationPreferenceRepository = {
    async get(userId) {
      return store.get(userId) ?? defaults(userId);
    },
    async update(userId, values) {
      const current = store.get(userId) ?? defaults(userId);
      const updated = { ...current, ...values, securityNotifications: true as const, updatedAt: "2026-07-02T00:10:00.000Z" };
      store.set(userId, updated);
      return updated;
    }
  };

  return { service: createPreferenceService({ preferences: repo }) };
}

describe("notification preference service", () => {
  it("returns defaults for a user with no stored preferences", async () => {
    const { service } = createPreferenceRepo();
    const result = await service.get(buyer);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.data.emailEnabled, true);
  });

  it("lets a user disable marketing emails and messaging notifications", async () => {
    const { service } = createPreferenceRepo();
    const result = await service.update(buyer, { marketingEmails: false, messagingNotifications: false });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.marketingEmails, false);
      assert.equal(result.data.messagingNotifications, false);
    }
  });

  it("refuses to disable security notifications", async () => {
    const { service } = createPreferenceRepo();
    const result = await service.update(buyer, { securityNotifications: false });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "SECURITY_NOTIFICATIONS_REQUIRED");

    const after = await service.get(buyer);
    if (after.ok) assert.equal(after.data.securityNotifications, true);
  });
});
