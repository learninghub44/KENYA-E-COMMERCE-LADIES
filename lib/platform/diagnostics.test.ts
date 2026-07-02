import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDiagnosticsService } from "./diagnostics";

describe("diagnostics service", () => {
  it("generates environment diagnostics", async () => {
    const svc = createDiagnosticsService({ env: { NODE_ENV: "test" } });
    const report = await svc.generate();

    assert.ok(report.environment.nodeVersion);
    assert.equal(report.environment.env, "test");
  });

  it("includes storage diagnostics when configured", async () => {
    const svc = createDiagnosticsService({
      runStorageCheck: async () => [{
        service: "storage",
        status: "healthy" as const,
        message: "Storage ok",
        latencyMs: 10,
        checkedAt: new Date().toISOString(),
      }],
    });

    const report = await svc.generate();
    assert.equal(report.storage.length, 1);
    assert.equal(report.storage[0]?.status, "healthy");
  });

  it("includes database diagnostics", async () => {
    const svc = createDiagnosticsService({
      runDatabaseCheck: async () => ({
        service: "database",
        status: "healthy" as const,
        message: "DB responsive",
        latencyMs: 5,
        checkedAt: new Date().toISOString(),
      }),
    });

    const report = await svc.generate();
    assert.equal(report.database.status, "healthy");
  });

  it("includes search diagnostics", async () => {
    const svc = createDiagnosticsService({
      runSearchCheck: async () => ({
        service: "search",
        status: "healthy" as const,
        message: "Search ok",
        latencyMs: 20,
        checkedAt: new Date().toISOString(),
      }),
    });

    const report = await svc.generate();
    assert.ok(report.search);
    assert.equal(report.search.status, "healthy");
  });

  it("handles null search check", async () => {
    const svc = createDiagnosticsService();
    const report = await svc.generate();
    assert.equal(report.search, null);
  });

  it("includes job diagnostics", async () => {
    const svc = createDiagnosticsService({
      runJobCheck: async () => ({
        service: "queue",
        status: "healthy" as const,
        message: "Queue ok",
        latencyMs: 3,
        checkedAt: new Date().toISOString(),
      }),
    });

    const report = await svc.generate();
    assert.equal(report.jobs.status, "healthy");
  });

  it("includes generated timestamp", async () => {
    const svc = createDiagnosticsService();
    const report = await svc.generate();
    assert.ok(report.generatedAt);
  });
});
