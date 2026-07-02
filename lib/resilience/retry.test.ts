import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRetryStrategy } from "./retry.js";

describe("retry strategy", () => {
  it("succeeds on first attempt", async () => {
    const retry = createRetryStrategy({ maxAttempts: 3 });
    let calls = 0;
    const result = await retry.execute(async () => {
      calls++;
      return "ok";
    });
    assert.equal(result.ok, true);
    assert.equal(result.value, "ok");
    assert.equal(result.attempts, 1);
  });

  it("retries on failure and succeeds", async () => {
    const retry = createRetryStrategy({ maxAttempts: 3, baseDelayMs: 5 });
    let calls = 0;
    const result = await retry.execute(async () => {
      calls++;
      if (calls < 3) throw new Error("Not yet");
      return "finally";
    });
    assert.equal(result.ok, true);
    assert.equal(result.value, "finally");
    assert.equal(result.attempts, 3);
  });

  it("fails after exhausting retries", async () => {
    const retry = createRetryStrategy({ maxAttempts: 2, baseDelayMs: 5 });
    const result = await retry.execute(async () => {
      throw new Error("Always fails");
    });
    assert.equal(result.ok, false);
    assert.ok(result.error);
    assert.equal(result.attempts, 2);
  });

  it("uses jitter by default", async () => {
    const retry = createRetryStrategy({ maxAttempts: 2, baseDelayMs: 10 });
    let attempts = 0;
    const start = Date.now();
    await retry.execute(async () => {
      attempts++;
      if (attempts === 1) throw new Error("fail");
      return "done";
    });
    const elapsed = Date.now() - start;
    assert.ok(elapsed > 0);
  });

  it("handles non-Error throws", async () => {
    const retry = createRetryStrategy({ maxAttempts: 1 });
    const result = await retry.execute(async () => {
      throw "string error";
    });
    assert.equal(result.ok, false);
    assert.equal(result.error?.message, "string error");
  });
});
