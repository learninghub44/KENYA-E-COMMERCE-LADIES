import { CreateJobInput, JobRecord, JobRepository, JobStatus } from "./types.js";

export interface JobsDbClient {
  from: (table: string) => {
    insert: (values: Record<string, unknown>) => { select: () => Promise<{ data: unknown; error: unknown }> };
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
  rpc: (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
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

export function createJobRepository(client: JobsDbClient): JobRepository {
  async function create(input: CreateJobInput): Promise<JobRecord> {
    const { data, error } = await client
      .from("platform_jobs")
      .insert({
        job_type: input.jobType,
        queue: input.queue ?? "default",
        priority: input.priority ?? 5,
        payload: input.payload ?? {},
        max_attempts: input.maxAttempts ?? 3,
        scheduled_at: input.scheduledAt ?? null,
        recurring_cron: input.recurringCron ?? null,
        timeout_seconds: input.timeoutSeconds ?? 30,
      })
      .select();

    if (error) throw new Error(`Failed to create job: ${JSON.stringify(error)}`);
    const rows = data as Record<string, unknown>[];
    return mapJobRow(rows[0] as Record<string, unknown>);
  }

  async function claimNext(queue: string): Promise<JobRecord | null> {
    const { data, error } = await client.rpc("platform_claim_next_job", { p_queue: queue });
    if (error) throw new Error(`Failed to claim job: ${JSON.stringify(error)}`);
    if (!data) return null;

    const jobId = data as string;
    const job = await getById(jobId);
    return job;
  }

  async function complete(jobId: string, errorMessage?: string): Promise<void> {
    const { error } = await client.rpc("platform_complete_job", {
      p_job_id: jobId,
      p_error_message: errorMessage ?? null,
    });
    if (error) throw new Error(`Failed to complete job: ${JSON.stringify(error)}`);
  }

  async function getById(jobId: string): Promise<JobRecord | null> {
    const { data, error } = await client
      .from("platform_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error) return null;
    return mapJobRow(data as Record<string, unknown>);
  }

  async function list(filters: { status?: JobStatus; queue?: string; jobType?: string }, cursor?: string, limit = 50) {
    let query = client.from("platform_jobs").select("*").order("created_at", { ascending: false });

    if (filters.status) {
      query = client.from("platform_jobs").select("*").order("created_at", { ascending: false });
    }
    const result = await query.limit(limit);
    const { data, error } = result as unknown as { data: unknown; error: unknown };

    if (error) throw new Error(`Failed to list jobs: ${JSON.stringify(error)}`);
    const rows = (data as Record<string, unknown>[]) ?? [];
    const jobs = rows.map(mapJobRow);
    const nextCursor = jobs.length === limit ? `${jobs[jobs.length - 1]?.createdAt}_${jobs[jobs.length - 1]?.id}` : null;
    return { data: jobs, nextCursor, total: jobs.length };
  }

  async function cancel(jobId: string): Promise<void> {
    const { error } = await client
      .from("platform_jobs")
      .update({ status: "cancelled" })
      .eq("id", jobId)
      .select();

    if (error) throw new Error(`Failed to cancel job: ${JSON.stringify(error)}`);
  }

  async function retryDeadLetter(jobId: string): Promise<void> {
    const { error } = await client
      .from("platform_jobs")
      .update({ status: "pending", attempts: 0, error_message: null, dead_letter_at: null })
      .eq("id", jobId)
      .select();

    if (error) throw new Error(`Failed to retry job: ${JSON.stringify(error)}`);
  }

  async function retryAllDeadLetters(queue?: string): Promise<number> {
    let count = 0;
    const { data, error } = await client
      .from("platform_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) throw new Error(`Failed to list dead letters: ${JSON.stringify(error)}`);
    const rows = (data as Record<string, unknown>[]) ?? [];
    const deadLetters = rows.filter((r) => r.status === "dead_letter" && (!queue || r.queue === queue));

    for (const row of deadLetters) {
      await retryDeadLetter(row.id as string);
      count++;
    }
    return count;
  }

  return { create, claimNext, complete, getById, list, cancel, retryDeadLetter, retryAllDeadLetters };
}
