import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createBulkhead } from "./bulkhead.js";

describe("bulkhead", () => {
  it("executes function when under limit", async () => {
    const bh = createBulkhead({ maxConcurrent: 5 });
    const result = await bh.execute(async () => "done");
    assert.equal(result, "done");
  });

  it("queues when at capacity", async () => {
    const bh = createBulkhead({ maxConcurrent: 1, maxQueueSize: 5 });
    const start = Date.now();

    const slow = bh.execute(async () => {
      await new Promise((r) => setTimeout(r, 50));
      return "slow";
    });

    const fast = bh.execute(async () => "fast");

    const [slowResult, fastResult] = await Promise.all([slow, fast]);
    assert.equal(slowResult, "slow");
    assert.equal(fastResult, "fast");
  });

  it("rejects when queue is full", async () => {
    const bh = createBulkhead({ maxConcurrent: 1, maxQueueSize: 1 });

    bh.execute(async () => { await new Promise((r) => setTimeout(r, 100)); return "a"; });
    bh.execute(async () => { await new Promise((r) => setTimeout(r, 100)); return "b"; });

    await assert.rejects(
      () => bh.execute(async () => "c"),
      /Bulkhead queue is full/,
    );
  });

  it("tracks active count and queue size", async () => {
    const bh = createBulkhead({ maxConcurrent: 2 });

    const promise = bh.execute(async () => {
      await new Promise((r) => setTimeout(r, 50));
      return "done";
    });

    assert.equal(bh.getActiveCount(), 1);
    assert.equal(bh.getQueueSize(), 0);
    await promise;
  });
});
