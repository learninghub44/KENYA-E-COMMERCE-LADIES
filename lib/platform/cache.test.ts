import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createCache } from "./cache";

describe("cache", () => {
  it("stores and retrieves values", async () => {
    const cache = createCache();
    await cache.set("key1", { hello: "world" });
    const value = await cache.get<{ hello: string }>("key1");
    assert.deepEqual(value, { hello: "world" });
  });

  it("returns null for missing keys", async () => {
    const cache = createCache();
    const value = await cache.get("nonexistent");
    assert.equal(value, null);
  });

  it("respects TTL", async () => {
    const cache = createCache();
    await cache.set("short", "value", 0);
    const value = await cache.get("short");
    assert.equal(value, null);
  });

  it("supports namespaces", async () => {
    const cache = createCache();
    await cache.set("key", "ns1-value", undefined, "ns1");
    await cache.set("key", "ns2-value", undefined, "ns2");

    const v1 = await cache.get("key", "ns1");
    const v2 = await cache.get("key", "ns2");
    assert.equal(v1, "ns1-value");
    assert.equal(v2, "ns2-value");
  });

  it("clear removes all entries", async () => {
    const cache = createCache();
    await cache.set("a", 1);
    await cache.set("b", 2);
    await cache.clear();
    assert.equal(await cache.get("a"), null);
    assert.equal(await cache.get("b"), null);
  });

  it("clear with namespace removes only that namespace", async () => {
    const cache = createCache();
    await cache.set("key", "global");
    await cache.set("key", "ns-value", undefined, "test-ns");
    await cache.clear("test-ns");
    assert.equal(await cache.get("key"), "global");
    assert.equal(await cache.get("key", "test-ns"), null);
  });

  it("getOrSet uses factory on miss", async () => {
    const cache = createCache();
    let calls = 0;
    const value = await cache.getOrSet("computed", async () => {
      calls++;
      return "computed-value";
    });
    assert.equal(value, "computed-value");
    assert.equal(calls, 1);
  });

  it("getOrSet returns cached value", async () => {
    const cache = createCache();
    let calls = 0;
    await cache.getOrSet("cached", async () => {
      calls++;
      return "first";
    });
    const value = await cache.getOrSet("cached", async () => {
      calls++;
      return "second";
    });
    assert.equal(value, "first");
    assert.equal(calls, 1);
  });

  it("tracks metrics", async () => {
    const cache = createCache();
    await cache.set("m1", 1);
    await cache.set("m2", 2);
    await cache.get("m1");
    await cache.get("missing");

    const metrics = cache.getMetrics();
    assert.equal(metrics.hits, 1);
    assert.equal(metrics.misses, 1);
    assert.equal(metrics.sets, 2);
    assert.equal(metrics.size, 2);
  });

  it("delete removes specific key", async () => {
    const cache = createCache();
    await cache.set("del-key", "value");
    await cache.delete("del-key");
    assert.equal(await cache.get("del-key"), null);
  });
});
