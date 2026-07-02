import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTimeoutStrategy } from "./times";

describe("timeout strategy", () => {
  it("resolves when function completes in time", async () => {
    const timeout = createTimeoutStrategy({ timeoutMs: 1000 });
    const result = await timeout.execute(async () => "done");
    assert.equal(result, "done");
  });

  it("rejects when function exceeds timeout", async () => {
    const timeout = createTimeoutStrategy({ timeoutMs: 10 });
    await assert.rejects(
      () => timeout.execute(async () => {
        await new Promise((r) => setTimeout(r, 100));
        return "late";
      }),
      /timed out/,
    );
  });

  it("rejects when function throws", async () => {
    const timeout = createTimeoutStrategy({ timeoutMs: 1000 });
    await assert.rejects(
      () => timeout.execute(async () => { throw new Error("Custom error"); }),
      /Custom error/,
    );
  });
});
