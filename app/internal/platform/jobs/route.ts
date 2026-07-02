import { authorizeRoute } from "../../../../middleware/auth-guard.js";
import type { JobRecord, JobStatus } from "../../../../lib/jobs/types.js";

interface JobsDbClient {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (col: string, val: unknown) => {
        single: () => Promise<{ data: unknown; error: unknown }>;
      };
      order: (col: string, opts: { ascending: boolean }) => {
        limit: (n: number) => Promise<{ data: unknown; error: unknown }>;
      };
    };
    update: (values: Record<string, unknown>) => {
      eq: (col: string, val: unknown) => {
        select: () => Promise<{ data: unknown; error: unknown }>;
      };
    };
  };
}

function mapJobRow(row: Record<string, unknown>): JobRecord {
  return {
    id: row.id as string,
    jobType: row.job_type as string,
    queue: row.queue as string,
    priority: row.priority as number,
    payload: row.payload as Record<string, unknown>,
    status: row.status as JobStatus,
    attempts: row.attempts as number,
    maxAttempts: row.max_attempts as number,
    scheduledAt: (row.scheduled_at as string) ?? null,
    startedAt: (row.started_at as string) ?? null,
    completedAt: (row.completed_at as string) ?? null,
    errorMessage: (row.error_message as string) ?? null,
    errorStack: (row.error_stack as string) ?? null,
    deadLetterAt: (row.dead_letter_at as string) ?? null,
    recurringCron: (row.recurring_cron as string) ?? null,
    timeoutSeconds: row.timeout_seconds as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function GET(request: Request) {
  const auth = authorizeRoute({ authLevel: "admin", roles: ["admin", "super_admin"] });
  if (!auth.allowed) {
    return Response.json({ error: auth.code }, { status: auth.status });
  }

  const url = new URL(request.url);
  const jobId = url.searchParams.get("jobId");

  const client: JobsDbClient = {
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (col: string, val: unknown) => ({
          single: async () => {
            const row: Record<string, unknown> = {
              id: val as string, job_type: "unknown", queue: "default", priority: 5,
              payload: {}, status: "pending", attempts: 0, max_attempts: 3,
              scheduled_at: null, started_at: null, completed_at: null,
              error_message: null, error_stack: null, dead_letter_at: null,
              recurring_cron: null, timeout_seconds: 30,
              created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
            };
            return { data: row, error: null };
          },
          order: (col: string, opts: { ascending: boolean }) => ({
            limit: async (n: number) => ({ data: [], error: null }),
          }),
        }),
      }),
      update: (values: Record<string, unknown>) => ({
        eq: (col: string, val: unknown) => ({
          select: async () => ({ data: [values], error: null }),
        }),
      }),
    }),
  };

  if (jobId) {
    const { data } = await client.from("platform_jobs").select("*").eq("id", jobId).single();
    if (!data) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    return Response.json(mapJobRow(data as Record<string, unknown>));
  }

  const { data } = await client.from("platform_jobs").select("*").order("created_at", { ascending: false }).limit(50);
  const jobs = ((data as Record<string, unknown>[]) ?? []).map(mapJobRow);
  return Response.json({ jobs, total: jobs.length });
}

export async function POST(request: Request) {
  const auth = authorizeRoute({ authLevel: "admin", roles: ["admin", "super_admin"] });
  if (!auth.allowed) {
    return Response.json({ error: auth.code }, { status: auth.status });
  }

  const body = await request.json() as { jobId: string; action: string };
  const client: JobsDbClient = {
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (col: string, val: unknown) => ({
          single: async () => ({ data: null, error: null }),
          order: (col: string, opts: { ascending: boolean }) => ({
            limit: async (n: number) => ({ data: [], error: null }),
          }),
        }),
      }),
      update: (values: Record<string, unknown>) => ({
        eq: (col: string, val: unknown) => ({
          select: async () => ({ data: [values], error: null }),
        }),
      }),
    }),
  };

  if (body.action === "cancel") {
    await client.from("platform_jobs").update({ status: "cancelled" }).eq("id", body.jobId).select();
    return Response.json({ ok: true });
  }

  if (body.action === "retry") {
    await client.from("platform_jobs").update({
      status: "pending", attempts: 0, error_message: null, dead_letter_at: null,
    }).eq("id", body.jobId).select();
    return Response.json({ ok: true });
  }

  return Response.json({ error: "invalid_action" }, { status: 400 });
}
