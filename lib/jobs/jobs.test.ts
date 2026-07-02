import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createJobService } from "./job-service.js";
import { createJobRepository } from "./job-repository.js";
import type { CreateJobInput, JobRecord, JobStatus } from "./types.js";

function createMockJobsDb() {
  const store = new Map<string, Record<string, unknown>>();
  let idCounter = 0;

  const client = {
    from: (_table: string) => ({
      insert: (values: Record<string, unknown>) => ({
        select: async () => {
          idCounter++;
          const id = crypto.randomUUID();
          const now = new Date().toISOString();
          const row: Record<string, unknown> = {
            id,
            job_type: values.job_type ?? "unknown",
            queue: values.queue ?? "default",
            priority: values.priority ?? 5,
            payload: values.payload ?? {},
            status: values.status ?? "pending",
            attempts: values.attempts ?? 0,
            max_attempts: values.max_attempts ?? 3,
            scheduled_at: values.scheduled_at ?? null,
            started_at: values.started_at ?? null,
            completed_at: values.completed_at ?? null,
            error_message: values.error_message ?? null,
            error_stack: values.error_stack ?? null,
            dead_letter_at: values.dead_letter_at ?? null,
            recurring_cron: values.recurring_cron ?? null,
            timeout_seconds: values.timeout_seconds ?? 30,
            created_at: now,
            updated_at: now,
          };
          store.set(id, row);
          return { data: [row], error: null };
        },
      }),
      select: (_columns: string) => ({
        eq: (col: string, val: unknown) => ({
          single: async () => {
            for (const row of store.values()) {
              if ((row as Record<string, unknown>)[col] === val) {
                return { data: row, error: null };
              }
            }
            return { data: null, error: { message: "not found" } };
          },
          order: (_col: string, _opts: { ascending: boolean }) => ({
            limit: async (_n: number) => ({ data: Array.from(store.values()), error: null }),
          }),
        }),
        order: (_col: string, _opts: { ascending: boolean }) => ({
          limit: async (_n: number) => ({ data: Array.from(store.values()), error: null }),
        }),
      }),
      update: (values: Record<string, unknown>) => ({
        eq: (col: string, val: unknown) => ({
          select: async () => {
            const row = store.get(val as string);
            if (row) {
              Object.assign(row, values);
            }
            return { data: row ? [row] : [], error: null };
          },
        }),
      }),
    }),
    rpc: async (_name: string, _params: Record<string, unknown>) => {
      for (const row of store.values()) {
        if (row.status === "pending") {
          row.status = "running";
          row.started_at = new Date().toISOString();
          row.attempts = (row.attempts as number) + 1;
          return { data: row.id, error: null };
        }
      }
      return { data: null, error: null };
    },
  };

  return client;
}

describe("job service", () => {
  it("enqueues a job", async () => {
    const client = createMockJobsDb();
    const repo = createJobRepository(client as never);
    const svc = createJobService({ repository: repo });

    const job = await svc.enqueue({ jobType: "email.send", payload: { to: "test@test.com" } });
    assert.ok(job.id);
    assert.equal(job.jobType, "email.send");
    assert.equal(job.status, "pending");
  });

  it("processes next job with registered handler", async () => {
    const client = createMockJobsDb();
    const repo = createJobRepository(client as never);
    const svc = createJobService({ repository: repo });

    let executed = false;
    svc.registerHandler({
      jobType: "test.handler",
      async execute() { executed = true; },
    });

    await svc.enqueue({ jobType: "test.handler" });
    const processed = await svc.processNext("default");
    assert.equal(processed, true);
    assert.equal(executed, true);
  });

  it("returns false when no jobs pending", async () => {
    const client = createMockJobsDb();
    const repo = createJobRepository(client as never);
    const svc = createJobService({ repository: repo });

    const processed = await svc.processNext("default");
    assert.equal(processed, false);
  });

  it("completes job with error message when handler missing", async () => {
    const client = createMockJobsDb();
    const repo = createJobRepository(client as never);
    const svc = createJobService({ repository: repo });

    await svc.enqueue({ jobType: "missing.handler" });
    const processed = await svc.processNext("default");
    assert.equal(processed, true);

    const job = await svc.getJob("unknown");
    assert.equal(job, null);
  });

  it("cancels a job", async () => {
    const client = createMockJobsDb();
    const repo = createJobRepository(client as never);
    const svc = createJobService({ repository: repo });

    const job = await svc.enqueue({ jobType: "email.send" });
    await svc.cancelJob(job.id);

    const cancelled = await svc.getJob(job.id);
    assert.equal(cancelled?.status, "cancelled");
  });

  it("lists jobs", async () => {
    const client = createMockJobsDb();
    const repo = createJobRepository(client as never);
    const svc = createJobService({ repository: repo });

    await svc.enqueue({ jobType: "email.send" });
    await svc.enqueue({ jobType: "search.index" });

    const result = await svc.listJobs({});
    assert.equal(result.data.length, 2);
  });
});

describe("job repository", () => {
  it("creates and retrieves a job", async () => {
    const client = createMockJobsDb();
    const repo = createJobRepository(client as never);

    const job = await repo.create({
      jobType: "cache.warm",
      queue: "cache",
      payload: { keys: ["a", "b"] },
    });

    const fetched = await repo.getById(job.id);
    assert.ok(fetched);
    assert.equal(fetched.jobType, "cache.warm");
  });

  it("claims next pending job", async () => {
    const client = createMockJobsDb();
    const repo = createJobRepository(client as never);

    await repo.create({ jobType: "cleanup.files", queue: "cleanup" });
    const claimed = await repo.claimNext("cleanup");
    assert.ok(claimed);
    assert.equal(claimed.status, "running");
    assert.equal(claimed.attempts, 1);
  });
});
