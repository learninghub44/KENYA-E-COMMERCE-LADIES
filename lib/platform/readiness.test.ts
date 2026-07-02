import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createReadinessService, createEnvReadinessCheck, createConnectivityReadinessCheck } from "./readiness.js";

describe("readiness service", () => {
  it("returns ready when all required checks pass", async () => {
    const svc = createReadinessService();
    svc.addCheck(createConnectivityReadinessCheck("database", async () => true, true));
    svc.addCheck(createConnectivityReadinessCheck("cache", async () => true, false));

    const report = await svc.runAll();
    assert.equal(report.ready, true);
  });

  it("returns not ready when required check fails", async () => {
    const svc = createReadinessService();
    svc.addCheck(createConnectivityReadinessCheck("database", async () => false, true));
    svc.addCheck(createConnectivityReadinessCheck("cache", async () => true, false));

    const report = await svc.runAll();
    assert.equal(report.ready, false);
  });

  it("allows optional checks to fail without affecting readiness", async () => {
    const svc = createReadinessService();
    svc.addCheck(createConnectivityReadinessCheck("database", async () => true, true));
    svc.addCheck(createConnectivityReadinessCheck("cache", async () => false, false));

    const report = await svc.runAll();
    assert.equal(report.ready, true);
  });

  it("handles exception in check", async () => {
    const svc = createReadinessService();
    svc.addCheck({
      name: "broken",
      required: true,
      async check() { throw new Error("Failed"); },
    });

    const report = await svc.runAll();
    assert.equal(report.ready, false);
  });

  it("env readiness fails when variables missing", async () => {
    const svc = createReadinessService();
    svc.addCheck(createEnvReadinessCheck());

    const report = await svc.runAll();
    assert.equal(report.checks[0]?.status, "critical");
  });

  it("accepts checks via constructor", async () => {
    const svc = createReadinessService({
      checks: [createConnectivityReadinessCheck("db", async () => true, true)],
    });
    const report = await svc.runAll();
    assert.equal(report.checks.length, 1);
  });
});
