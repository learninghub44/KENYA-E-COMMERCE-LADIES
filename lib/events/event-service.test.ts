import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EVENT_TYPES, createEventSchema, eventFiltersSchema } from "./types";
import { createEventService } from "./event-service";
import { EventRepository, InternalEvent } from "./types";

describe("event service", () => {
  function createMockRepo(): EventRepository {
    const events: InternalEvent[] = [];
    return {
      create: async (input) => {
        const event: InternalEvent = {
          id: `evt-${events.length + 1}`,
          eventType: input.eventType,
          eventVersion: input.eventVersion ?? 1,
          userId: input.userId ?? null,
          sellerId: input.sellerId ?? null,
          sessionId: input.sessionId ?? null,
          requestId: input.requestId ?? null,
          entityType: input.entityType ?? null,
          entityId: input.entityId ?? null,
          metadata: input.metadata ?? {},
          deviceInfo: input.deviceInfo ?? {},
          ipHash: input.ipHash ?? null,
          userAgent: input.userAgent ?? null,
          source: input.source ?? "internal",
          platform: input.platform ?? null,
          createdAt: new Date().toISOString(),
          archivedAt: null,
        };
        events.push(event);
        return event;
      },
      findById: async (id) => events.find((e) => e.id === id) ?? null,
      list: async () => ({ data: events, nextCursor: null, total: events.length }),
      listEventTypes: async () => events.map((e) => e.eventType),
      getStatistics: async () => ({
        totalEvents: events.length,
        uniqueEventTypes: new Set(events.map((e) => e.eventType)).size,
        uniqueUsers: new Set(events.filter((e) => e.userId).map((e) => e.userId)).size,
        uniqueSessions: new Set(events.filter((e) => e.sessionId).map((e) => e.sessionId)).size,
        eventsByType: [],
        eventsByDay: [],
      }),
      aggregateHourly: async () => {},
      aggregateDaily: async () => {},
      archiveEvents: async () => 0,
    };
  }

  it("creates an event with valid input", async () => {
    const service = createEventService({ repository: createMockRepo() });
    const event = await service.createEvent({
      eventType: EVENT_TYPES.USER_REGISTERED,
      userId: "550e8400-e29b-41d4-a716-446655440000",
      source: "web",
      metadata: { email: "test@example.com" },
    });

    assert.equal(event.eventType, "user.registered");
    assert.equal(event.source, "web");
    assert.equal(event.eventVersion, 1);
  });

  it("rejects invalid event types", async () => {
    const service = createEventService({ repository: createMockRepo() });
    await assert.rejects(
      () => service.createEvent({ eventType: "invalid.type" as never }),
      /Invalid/,
    );
  });

  it("lists events with cursor pagination", async () => {
    const service = createEventService({ repository: createMockRepo() });
      await service.createEvent({ eventType: EVENT_TYPES.LOGIN, userId: "550e8400-e29b-41d4-a716-446655440001" });
      await service.createEvent({ eventType: EVENT_TYPES.LOGOUT, userId: "550e8400-e29b-41d4-a716-446655440001" });

      const result = await service.listEvents({});
      assert.equal(result.total, 2);
      assert.equal(result.data.length, 2);
    });

    it("gets event statistics", async () => {
      const repo = createMockRepo();
      const service = createEventService({ repository: repo });
      await service.createEvent({ eventType: EVENT_TYPES.LOGIN, userId: "550e8400-e29b-41d4-a716-446655440001" });
      await service.createEvent({ eventType: EVENT_TYPES.LOGIN, userId: "550e8400-e29b-41d4-a716-446655440002" });

    const stats = await service.getStatistics("2026-01-01", "2026-12-31");
    assert.equal(stats.totalEvents, 2);
    assert.equal(stats.uniqueUsers, 2);
  });

  it("archives old events", async () => {
    const repo = createMockRepo();
    const service = createEventService({ repository: repo });
    const count = await service.archiveEvents("2025-01-01");
    assert.equal(count, 0);
  });
});

describe("event schemas", () => {
  it("validates create event schema", () => {
    const valid = createEventSchema.safeParse({
      eventType: "user.registered",
      userId: "550e8400-e29b-41d4-a716-446655440000",
    });
    assert.equal(valid.success, true);

    const invalid = createEventSchema.safeParse({ eventType: "bad" });
    assert.equal(invalid.success, false);
  });

  it("validates event filter schema", () => {
    const valid = eventFiltersSchema.safeParse({
      startDate: "2026-01-01",
      endDate: "2026-12-31",
    });
    assert.equal(valid.success, true);
  });
});

describe("event type definitions", () => {
  it("defines all required event categories", () => {
    assert.ok(EVENT_TYPES.USER_REGISTERED);
    assert.ok(EVENT_TYPES.PRODUCT_VIEWED);
    assert.ok(EVENT_TYPES.SEARCH_PERFORMED);
    assert.ok(EVENT_TYPES.CART_CREATED);
    assert.ok(EVENT_TYPES.CHECKOUT_STARTED);
    assert.ok(EVENT_TYPES.ORDER_CREATED);
    assert.ok(EVENT_TYPES.SELLER_REGISTERED);
    assert.ok(EVENT_TYPES.REVIEW_CREATED);
    assert.ok(EVENT_TYPES.CONVERSATION_STARTED);
    assert.ok(EVENT_TYPES.NOTIFICATION_CREATED);
  });
});
