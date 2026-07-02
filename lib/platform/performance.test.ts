import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRequestBatcher, createLazyLoader, paginate, batchArray, compressInput } from "./performance.js";

describe("request batcher", () => {
  it("batches items and resolves with results", async () => {
    const batcher = createRequestBatcher<number, string>(async (items) => {
      return items.map((n) => `value-${n}`);
    }, { maxBatchSize: 10, batchWindowMs: 0 });

    const [a, b, c] = await Promise.all([
      batcher.add(1),
      batcher.add(2),
      batcher.add(3),
    ]);

    assert.equal(a, "value-1");
    assert.equal(b, "value-2");
    assert.equal(c, "value-3");
  });

  it("flushes pending items", async () => {
    let processed: number[] = [];
    const batcher = createRequestBatcher<number, number>(async (items) => {
      processed.push(...items);
      return items;
    }, { maxBatchSize: 100, batchWindowMs: 5000 });

    batcher.add(1);
    batcher.add(2);
    await batcher.flush();

    assert.deepEqual(processed, [1, 2]);
  });

  it("reports correct size", async () => {
    const batcher = createRequestBatcher<number, number>(async (items) => items, {
      maxBatchSize: 100, batchWindowMs: 5000,
    });

    const promise = batcher.add(1);
    assert.equal(batcher.size(), 1);
    await batcher.flush();
    await promise;
    assert.equal(batcher.size(), 0);
  });
});

describe("lazy loader", () => {
  it("creates instance on first get", () => {
    let calls = 0;
    const loader = createLazyLoader(() => {
      calls++;
      return { data: 42 };
    });

    assert.equal(loader.loaded, false);
    const val = loader.get();
    assert.equal(val.data, 42);
    assert.equal(loader.loaded, true);
    assert.equal(calls, 1);
  });

  it("returns cached instance on subsequent gets", () => {
    let calls = 0;
    const loader = createLazyLoader(() => {
      calls++;
      return Math.random();
    });

    const first = loader.get();
    const second = loader.get();
    assert.equal(first, second);
    assert.equal(calls, 1);
  });

  it("reset clears the cache", () => {
    let calls = 0;
    const loader = createLazyLoader(() => {
      calls++;
      return Math.random();
    });

    loader.get();
    loader.reset();
    assert.equal(loader.loaded, false);
    loader.get();
    assert.equal(calls, 2);
  });
});

describe("paginate", () => {
  const items = ["a", "b", "c", "d", "e"];

  it("returns first page", () => {
    const result = paginate(items, { limit: 3 }, (x) => x);
    assert.deepEqual(result.data, ["a", "b", "c"]);
    assert.equal(result.nextCursor, "c");
    assert.equal(result.total, 5);
  });

  it("uses cursor for next page", () => {
    const result = paginate(items, { cursor: "c", limit: 3 }, (x) => x);
    assert.deepEqual(result.data, ["d", "e"]);
    assert.equal(result.nextCursor, null);
  });

  it("returns empty data for unknown cursor", () => {
    const result = paginate(items, { cursor: "z", limit: 3 }, (x) => x);
    assert.deepEqual(result.data, ["a", "b", "c"]);
  });
});

describe("batchArray", () => {
  it("splits array into batches", () => {
    const result = batchArray([1, 2, 3, 4, 5], 2);
    assert.deepEqual(result, [[1, 2], [3, 4], [5]]);
  });

  it("returns single batch for smaller size", () => {
    const result = batchArray([1, 2, 3], 10);
    assert.deepEqual(result, [[1, 2, 3]]);
  });
});

describe("compressInput", () => {
  it("picks only specified fields", () => {
    const input = { a: 1, b: "hello", c: true };
    const compressed = compressInput(input, ["a", "c"]);
    assert.deepEqual(compressed, { a: 1, c: true });
  });
});
