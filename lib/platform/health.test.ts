import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createHealthService, createDatabaseHealthCheck, createCacheHealthCheck, createQueueHealthCheck, createStorageHealthCheck } from "./health.js";

describe("health service", () => {
  it("returns healthy when all checks pass", async () => {
    const health = createHealthService();
    health.registerCheck(createDatabaseHealthCheck(async () => true));
    health.registerCheck(createCacheHealthCheck(async () => true));

    const report = await health.runAll();
    assert.equal(report.overall, "healthy");
    assert.equal(report.checks.length, 2);
  });

  it("returns critical when a check fails", async () => {
    const health = createHealthService();
    health.registerCheck(createDatabaseHealthCheck(async () => false));
    health.registerCheck(createCacheHealthCheck(async () => true));

    const report = await health.runAll();
    assert.equal(report.overall, "critical");
  });

  it("returns warning when cache check fails", async () => {
    const health = createHealthService();
    health.registerCheck(createDatabaseHealthCheck(async () => true));
    health.registerCheck(createCacheHealthCheck(async () => false));

    const report = await health.runAll();
    assert.equal(report.overall, "warning");
  });

  it("handles exceptions in health checks", async () => {
    const health = createHealthService();
    health.registerCheck({
      name: "failing",
      async check() { throw new Error("Connection refused"); },
    });

    const report = await health.runAll();
    assert.equal(report.overall, "critical");
    assert.equal(report.checks[0]?.message, "Connection refused");
  });

  it("runs a single check by name", async () => {
    const health = createHealthService();
    health.registerCheck(createDatabaseHealthCheck(async () => true));

    const result = await health.runCheck("database");
    assert.ok(result);
    assert.equal(result.status, "healthy");
  });

  it("returns null for unknown check", async () => {
    const health = createHealthService();
    const result = await health.runCheck("nonexistent");
    assert.equal(result, null);
  });

  it("includes latency in results", async () => {
    const health = createHealthService();
    health.registerCheck(createDatabaseHealthCheck(async () => {
      await new Promise((r) => setTimeout(r, 5));
      return true;
    }));

    const report = await health.runAll();
    assert.ok(report.checks[0]!.latencyMs >= 5);
  });

  it("registers checks via constructor", async () => {
    const health = createHealthService({
      checks: [createDatabaseHealthCheck(async () => true)],
    });
    const report = await health.runAll();
    assert.equal(report.checks.length, 1);
  });
});
