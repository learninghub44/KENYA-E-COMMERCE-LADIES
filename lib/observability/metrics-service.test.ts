import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createAppMetricRepository, createDbMetricRepository, createCacheMetricRepository, createStorageMetricRepository, createPerformanceTracker } from "./metrics-service";
import { MetricsRepositoryClient } from "./metrics-service";

describe("observability metrics", () => {
  function createMockClient(): MetricsRepositoryClient {
    const records: Array<Record<string, unknown>> = [];
    return {
      from: () => ({
        insert: async (values: Record<string, unknown> | Record<string, unknown>[]) => {
          if (Array.isArray(values)) records.push(...values);
          else records.push(values);
          return { error: null };
        },
        select: () => ({
          order: () => ({
            gte: () => ({
              lte: async () => ({ data: records, error: null }),
            }),
          }),
          gte: () => ({
            lte: async () => ({ data: records, error: null }),
          }),
        }),
      }),
    };
  }

  it("records and queries app metrics", async () => {
    const repo = createAppMetricRepository(createMockClient());
    await repo.record({ metricName: "request_count", metricValue: 100, tags: { endpoint: "/api/test" } });

    const records = await repo.query("request_count", "2026-01-01", "2026-12-31");
    assert.equal(records.length, 1);
    assert.equal(records[0]?.metricName, "request_count");
  });

  it("records batch app metrics", async () => {
    const repo = createAppMetricRepository(createMockClient());
    await repo.recordBatch([
      { metricName: "latency_ms", metricValue: 45 },
      { metricName: "latency_ms", metricValue: 120 },
    ]);
  });

  it("computes metric summary", async () => {
    const repo = createAppMetricRepository(createMockClient());
    await repo.record({ metricName: "latency_ms", metricValue: 50 });
    await repo.record({ metricName: "latency_ms", metricValue: 100 });
    await repo.record({ metricName: "latency_ms", metricValue: 150 });

    const summary = await repo.getSummary("latency_ms", "2026-01-01", "2026-12-31");
    assert.equal(summary.count, 3);
    assert.equal(summary.average, 100);
    assert.equal(summary.min, 50);
    assert.equal(summary.max, 150);
    assert.equal(summary.sum, 300);
  });

  it("records database metrics", async () => {
    const repo = createDbMetricRepository(createMockClient());
    await repo.record({ querySource: "products", queryCount: 50, totalDurationMs: 200, slowQueryCount: 2 });
    const summary = await repo.getSummary("2026-01-01", "2026-12-31");
    assert.equal(summary.totalQueries, 50);
    assert.ok(summary.avgDurationMs > 0);
  });

  it("records cache metrics with hit ratio", async () => {
    const repo = createCacheMetricRepository(createMockClient());
    await repo.record({ cacheName: "products", hits: 80, misses: 20 });
    const summary = await repo.getSummary("products", "2026-01-01", "2026-12-31");
    assert.equal(summary.totalHits, 80);
    assert.equal(summary.totalMisses, 20);
    assert.equal(summary.avgHitRatio, 0.8);
  });

  it("records storage metrics", async () => {
    const repo = createStorageMetricRepository(createMockClient());
    await repo.record({ storageType: "cloudinary", totalImages: 500, totalBytes: 104857600 });
    const summary = await repo.getSummary("2026-01-01", "2026-12-31");
    assert.equal(summary.totalImages, 500);
    assert.ok(summary.totalBytes > 0);
  });

  it("tracks performance with timer", () => {
    const tracker = createPerformanceTracker();
    const timer = tracker.startTimer("get_products");
    assert.ok(timer.end);
  });
});
