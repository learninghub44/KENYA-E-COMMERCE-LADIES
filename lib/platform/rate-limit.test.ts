import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRateLimitService } from "./rate-limit.js";

describe("rate limit service", () => {
  it("allows first request", async () => {
    const store = new Map();
    const svc = createRateLimitService({ store: store as never });

    const result = await svc.increment({ limitType: "api", limitKey: "test-key", maxRequests: 5 });
    assert.equal(result.allowed, true);
    assert.equal(result.currentCount, 1);
    assert.equal(result.remaining, 4);
  });

  it("rejects when limit exceeded", async () => {
    const store = new Map();
    const svc = createRateLimitService({ store: store as never });

    for (let i = 0; i < 3; i++) {
      await svc.increment({ limitType: "api", limitKey: "strict", maxRequests: 2 });
    }

    const result = await svc.check({ limitType: "api", limitKey: "strict", maxRequests: 2 });
    assert.equal(result.allowed, false);
    assert.equal(result.remaining, 0);
  });

  it("resets after window expires", async () => {
    const store = new Map();
    const svc = createRateLimitService({ store: store as never });

    await svc.increment({ limitType: "user", limitKey: "user-1", windowSeconds: 1, maxRequests: 1 });
    let result = await svc.check({ limitType: "user", limitKey: "user-1", windowSeconds: 1, maxRequests: 1 });
    assert.equal(result.allowed, false);

    await new Promise((r) => setTimeout(r, 2000));
    result = await svc.check({ limitType: "user", limitKey: "user-1", windowSeconds: 1, maxRequests: 1 });
    assert.equal(result.allowed, true);
  });

  it("resets specific counter", async () => {
    const store = new Map();
    const svc = createRateLimitService({ store: store as never });

    await svc.increment({ limitType: "ip", limitKey: "192.168.1.1", maxRequests: 1 });
    await svc.reset("ip", "192.168.1.1");
    const result = await svc.check({ limitType: "ip", limitKey: "192.168.1.1", maxRequests: 1 });
    assert.equal(result.allowed, true);
  });

  it("supports different limit types", async () => {
    const store = new Map();
    const svc = createRateLimitService({ store: store as never });

    const r1 = await svc.increment({ limitType: "user", limitKey: "alice", maxRequests: 5 });
    const r2 = await svc.increment({ limitType: "seller", limitKey: "store-1", maxRequests: 10 });

    assert.equal(r1.allowed, true);
    assert.equal(r2.allowed, true);
    assert.equal(r1.currentCount, 1);
    assert.equal(r2.currentCount, 1);
  });
});
