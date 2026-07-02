import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createReplayService } from "./replay-service.js";
import { EventReplayHandler, EventRepository, InternalEvent } from "./types.js";

describe("replay service", () => {
  it("replays events through a handler", async () => {
    const events: InternalEvent[] = [
      { id: "1", eventType: "user.registered", eventVersion: 1, userId: "u1", sellerId: null, sessionId: null, requestId: null, entityType: null, entityId: null, metadata: {}, deviceInfo: {}, ipHash: null, userAgent: null, source: "internal", platform: null, createdAt: "2026-01-01", archivedAt: null },
      { id: "2", eventType: "user.login", eventVersion: 1, userId: "u1", sellerId: null, sessionId: null, requestId: null, entityType: null, entityId: null, metadata: {}, deviceInfo: {}, ipHash: null, userAgent: null, source: "internal", platform: null, createdAt: "2026-01-02", archivedAt: null },
    ];

    const repo: EventRepository = {
      create: async () => { throw new Error("unused"); },
      findById: async () => null,
      list: async () => ({ data: events, nextCursor: null, total: events.length }),
      listEventTypes: async () => [],
      getStatistics: async () => ({ totalEvents: 0, uniqueEventTypes: 0, uniqueUsers: 0, uniqueSessions: 0, eventsByType: [], eventsByDay: [] }),
      aggregateHourly: async () => {},
      aggregateDaily: async () => {},
      archiveEvents: async () => 0,
    };

    const service = createReplayService({ repository: repo });
    const handled: string[] = [];
    const handler: EventReplayHandler = {
      handleEvent: async (event) => { handled.push(event.id); },
    };

    const count = await service.replayEvents({}, handler);
    assert.equal(count, 2);
    assert.deepEqual(handled, ["1", "2"]);
  });
});
