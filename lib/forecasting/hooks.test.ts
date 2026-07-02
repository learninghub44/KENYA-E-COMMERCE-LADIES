import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createForecastingService } from "./hooks";
import { ForecastingHook, ForecastingHookRepository, ForecastingHookHandler } from "./types";

describe("forecasting hooks", () => {
  function createMockRepo(): ForecastingHookRepository {
    const hooks: ForecastingHook[] = [
      { id: "h1", hookName: "sales_forecast", hookType: "forecast", description: "Sales prediction", inputSchema: {}, outputSchema: {}, isActive: true, lastInvokedAt: null, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
      { id: "h2", hookName: "inactive_hook", hookType: "forecast", description: "Inactive", inputSchema: {}, outputSchema: {}, isActive: false, lastInvokedAt: null, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    ];
    const invocations: Array<Record<string, unknown>> = [];

    return {
      listActiveHooks: async () => hooks.filter((h) => h.isActive),
      getHookByName: async (name) => hooks.find((h) => h.hookName === name) ?? null,
      recordInvocation: async (inv) => { invocations.push({ ...inv }); },
      updateLastInvoked: async () => {},
    };
  }

  it("lists active forecasting hooks", async () => {
    const service = createForecastingService({ repository: createMockRepo() });
    const hooks = await service.getAvailableHooks();
    assert.equal(hooks.length, 1);
    assert.equal(hooks[0]?.hookName, "sales_forecast");
  });

  it("invokes a hook with registered handler", async () => {
    const handler: ForecastingHookHandler<{ days: number }, { result: string }> = {
      hookName: "sales_forecast",
      execute: async (input) => ({ result: `Forecast for ${input.days} days` }),
    };

    const handlers = new Map();
    handlers.set("sales_forecast", handler);

    const service = createForecastingService({ repository: createMockRepo(), handlers });
    const result = await service.invokeHook("sales_forecast", { days: 30 });
    assert.deepEqual(result, { result: "Forecast for 30 days" });
  });

  it("invokes a hook without registered handler (fallback)", async () => {
    const service = createForecastingService({ repository: createMockRepo() });
    const result = await service.invokeHook("sales_forecast", {});
    assert.ok(typeof result === "object");
    assert.ok((result as Record<string, unknown>).message);
  });

  it("rejects invocation of non-existent hook", async () => {
    const service = createForecastingService({ repository: createMockRepo() });
    await assert.rejects(
      () => service.invokeHook("nonexistent", {}),
      /not found/,
    );
  });

  it("rejects invocation of inactive hook", async () => {
    const service = createForecastingService({ repository: createMockRepo() });
    await assert.rejects(
      () => service.invokeHook("inactive_hook", {}),
      /not active/,
    );
  });
});
