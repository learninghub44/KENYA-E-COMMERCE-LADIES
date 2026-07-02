import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createCircuitBreaker } from "./circuit-breaker";

describe("circuit breaker", () => {
  it("starts closed", () => {
    const cb = createCircuitBreaker();
    assert.equal(cb.getState(), "closed");
  });

  it("opens after threshold failures", async () => {
    const cb = createCircuitBreaker({ failureThreshold: 2, openTimeoutMs: 10000 });

    for (let i = 0; i < 2; i++) {
      await assert.rejects(() => cb.call(async () => { throw new Error("fail"); }));
    }

    assert.equal(cb.getState(), "open");
  });

  it("rejects calls when open", async () => {
    const cb = createCircuitBreaker({ failureThreshold: 1, openTimeoutMs: 10000 });

    await assert.rejects(() => cb.call(async () => { throw new Error("fail"); }));
    await assert.rejects(() => cb.call(async () => "value"), /Circuit breaker is open/);
  });

  it("allows half-open after timeout", async () => {
    const cb = createCircuitBreaker({ failureThreshold: 1, openTimeoutMs: 10 });

    await assert.rejects(() => cb.call(async () => { throw new Error("fail"); }));
    await new Promise((r) => setTimeout(r, 15));

    assert.equal(cb.getState(), "half_open");
  });

  it("closes after success threshold in half-open", async () => {
    const cb = createCircuitBreaker({ failureThreshold: 1, successThreshold: 2, openTimeoutMs: 10, halfOpenMaxRequests: 2 });

    await assert.rejects(() => cb.call(async () => { throw new Error("fail"); }));
    await new Promise((r) => setTimeout(r, 15));

    await cb.call(async () => "ok");
    await cb.call(async () => "ok");

    assert.equal(cb.getState(), "closed");
  });

  it("reopens on failure in half-open", async () => {
    const cb = createCircuitBreaker({ failureThreshold: 1, successThreshold: 1, openTimeoutMs: 10 });

    await assert.rejects(() => cb.call(async () => { throw new Error("fail"); }));
    await new Promise((r) => setTimeout(r, 15));

    await assert.rejects(() => cb.call(async () => { throw new Error("fail again"); }));
    assert.equal(cb.getState(), "open");
  });

  it("reset returns to closed", async () => {
    const cb = createCircuitBreaker({ failureThreshold: 1, openTimeoutMs: 10000 });

    await assert.rejects(() => cb.call(async () => { throw new Error("fail"); }));
    cb.reset();
    assert.equal(cb.getState(), "closed");
  });

  it("getMetrics returns counters", async () => {
    const cb = createCircuitBreaker({ failureThreshold: 3 });

    await assert.rejects(() => cb.call(async () => { throw new Error("fail"); }));
    await assert.rejects(() => cb.call(async () => { throw new Error("fail"); }));

    const metrics = cb.getMetrics();
    assert.equal(metrics.failureCount, 2);
    assert.equal(metrics.successCount, 0);
    assert.equal(metrics.state, "closed");
  });
});
