import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createMaintenanceService } from "./maintenance.js";

function createMockClient() {
  const store = new Map<string, Record<string, unknown>>();

  function filterRows(col: string, val: unknown): Record<string, unknown>[] {
    return Array.from(store.values()).filter((r) => (r as Record<string, unknown>)[col] === val);
  }

  return {
    from: (_table: string) => ({
      select: (_columns: string) => {
        const allRows = () => Array.from(store.values());
        return {
          eq: (col: string, val: unknown) => {
            const filtered = filterRows(col, val);
            return {
              single: async () => {
                const match = filtered[0] ?? null;
                return { data: match, error: match ? null : { message: "not found" } };
              },
              order: (_col2: string, _opts: { ascending: boolean }) => ({
                limit: async (_n: number) => ({ data: filtered, error: null }),
              }),
            };
          },
          order: (_col: string, _opts: { ascending: boolean }) => ({
            limit: async (_n: number) => ({ data: allRows(), error: null }),
          }),
        };
      },
      insert: (values: Record<string, unknown>) => ({
        select: async () => {
          const id = crypto.randomUUID();
          const now = new Date().toISOString();
          const row: Record<string, unknown> = { id, ...values, created_at: now, updated_at: now };
          store.set(id, row);
          return { data: [row], error: null };
        },
      }),
      update: (values: Record<string, unknown>) => ({
        eq: (col: string, val: unknown) => ({
          select: async () => {
            const row = store.get(val as string);
            if (row) Object.assign(row, values);
            return { data: row ? [row] : [], error: null };
          },
        }),
      }),
    }),
    rpc: async (_name: string, _params?: Record<string, unknown>) => ({ data: null, error: null }),
  };
}

describe("maintenance service", () => {
  it("enables maintenance mode", async () => {
    const svc = createMaintenanceService({ supabaseClient: createMockClient() as never });
    const window = await svc.enable("global", "System maintenance");
    assert.equal(window.maintenanceType, "global");
    assert.equal(window.isActive, true);
  });

  it("disables maintenance mode", async () => {
    const svc = createMaintenanceService({ supabaseClient: createMockClient() as never });
    await svc.enable("global");
    await svc.disable();
    const active = await svc.isActive();
    assert.equal(active, null);
  });

  it("detects read-only mode", async () => {
    const svc = createMaintenanceService({ supabaseClient: createMockClient() as never });
    await svc.enable("read_only");
    const readOnly = await svc.isReadOnly();
    assert.equal(readOnly, true);
  });

  it("returns false for isReadOnly when not active", async () => {
    const svc = createMaintenanceService({ supabaseClient: createMockClient() as never });
    const readOnly = await svc.isReadOnly();
    assert.equal(readOnly, false);
  });

  it("schedules maintenance", async () => {
    const svc = createMaintenanceService({ supabaseClient: createMockClient() as never });
    const window = await svc.schedule("scheduled", "Nightly cleanup", "2026-07-03T00:00:00Z", "2026-07-03T04:00:00Z");
    assert.equal(window.maintenanceType, "scheduled");
    assert.equal(window.isActive, false);
    assert.equal(window.message, "Nightly cleanup");
  });

  it("lists maintenance windows", async () => {
    const svc = createMaintenanceService({ supabaseClient: createMockClient() as never });
    await svc.enable("global");
    const list = await svc.list();
    assert.ok(list.length >= 1);
  });
});
