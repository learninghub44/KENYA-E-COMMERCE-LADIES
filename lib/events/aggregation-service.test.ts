import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createAggregationService } from "./aggregation-service";
import { EventRepository } from "./types";

describe("aggregation service", () => {
  function createMockRepo(): EventRepository {
    return {
      create: async (i) => { throw new Error("unused"); },
      findById: async () => null,
      list: async () => ({ data: [], nextCursor: null, total: 0 }),
      listEventTypes: async () => [],
      getStatistics: async () => ({ totalEvents: 0, uniqueEventTypes: 0, uniqueUsers: 0, uniqueSessions: 0, eventsByType: [], eventsByDay: [] }),
      aggregateHourly: async () => {},
      aggregateDaily: async () => {},
      archiveEvents: async () => 0,
    };
  }

  it("computes hourly bucket start", () => {
    const service = createAggregationService({ repository: createMockRepo() });
    const date = new Date("2026-07-02T14:25:30Z");
    const bucket = service.getBucketStart(date, "hourly");
    assert.equal(bucket.getUTCHours(), 14);
    assert.equal(bucket.getUTCMinutes(), 0);
    assert.equal(bucket.getUTCSeconds(), 0);
  });

  it("computes daily bucket start", () => {
    const service = createAggregationService({ repository: createMockRepo() });
    const date = new Date("2026-07-02T14:25:30Z");
    const bucket = service.getBucketStart(date, "daily");
    assert.equal(bucket.getUTCHours(), 0);
    assert.equal(bucket.getUTCMinutes(), 0);
    assert.equal(bucket.getDate(), 2);
  });

  it("computes weekly bucket start", () => {
    const service = createAggregationService({ repository: createMockRepo() });
    const date = new Date("2026-07-02T14:25:30Z"); // Thursday
    const bucket = service.getBucketStart(date, "weekly");
    assert.equal(bucket.getUTCDay(), 0); // Sunday
  });

  it("computes monthly bucket start", () => {
    const service = createAggregationService({ repository: createMockRepo() });
    const date = new Date("2026-07-02T14:25:30Z");
    const bucket = service.getBucketStart(date, "monthly");
    assert.equal(bucket.getUTCDate(), 1);
    assert.equal(bucket.getUTCMonth(), 6); // July
  });

  it("computes yearly bucket start", () => {
    const service = createAggregationService({ repository: createMockRepo() });
    const date = new Date("2026-07-02T14:25:30Z");
    const bucket = service.getBucketStart(date, "yearly");
    assert.equal(bucket.getUTCMonth(), 0);
    assert.equal(bucket.getUTCDate(), 1);
    assert.equal(bucket.getUTCFullYear(), 2026);
  });
});
