import { z } from "zod";

export const JOB_QUEUES = [
  "default",
  "search",
  "email",
  "analytics",
  "media",
  "cleanup",
  "verification",
  "cache",
] as const;
export type JobQueue = (typeof JOB_QUEUES)[number];

export const JOB_STATUSES = [
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled",
  "dead_letter",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_TYPES = [
  "product.index",
  "search.index",
  "thumbnail.generate",
  "email.send",
  "analytics.aggregate",
  "cache.warm",
  "cleanup.files",
  "cleanup.cache",
  "seller.verify",
  "cache.clear",
] as const;
export type JobType = (typeof JOB_TYPES)[number];

export interface JobRecord {
  id: string;
  jobType: string;
  queue: string;
  priority: number;
  payload: Record<string, unknown>;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  errorStack: string | null;
  deadLetterAt: string | null;
  recurringCron: string | null;
  timeoutSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobInput {
  jobType: string;
  queue?: JobQueue;
  priority?: number;
  payload?: Record<string, unknown>;
  maxAttempts?: number;
  scheduledAt?: string | undefined;
  recurringCron?: string | undefined;
  timeoutSeconds?: number;
}

export interface JobHandler {
  jobType: string;
  execute(payload: Record<string, unknown>, job: JobRecord): Promise<void>;
}

export interface JobRepository {
  create(input: CreateJobInput): Promise<JobRecord>;
  claimNext(queue: string): Promise<JobRecord | null>;
  complete(jobId: string, errorMessage?: string): Promise<void>;
  getById(jobId: string): Promise<JobRecord | null>;
  list(filters: { status?: JobStatus; queue?: string; jobType?: string }, cursor?: string, limit?: number): Promise<{ data: JobRecord[]; nextCursor: string | null; total: number }>;
  cancel(jobId: string): Promise<void>;
  retryDeadLetter(jobId: string): Promise<void>;
  retryAllDeadLetters(queue?: string): Promise<number>;
}

export interface JobService {
  enqueue(input: CreateJobInput): Promise<JobRecord>;
  processNext(queue: string): Promise<boolean>;
  registerHandler(handler: JobHandler): void;
  getJob(jobId: string): Promise<JobRecord | null>;
  listJobs(filters: { status?: JobStatus; queue?: string; jobType?: string }, cursor?: string, limit?: number): Promise<{ data: JobRecord[]; nextCursor: string | null; total: number }>;
  cancelJob(jobId: string): Promise<void>;
  retryJob(jobId: string): Promise<void>;
  retryAll(queue?: string): Promise<number>;
}

export const createJobSchema = z.object({
  jobType: z.string().min(1).max(100),
  queue: z.enum(JOB_QUEUES).default("default"),
  priority: z.number().int().min(1).max(10).default(5),
  payload: z.record(z.unknown()).default({}),
  maxAttempts: z.number().int().min(1).max(25).default(3),
  scheduledAt: z.string().datetime().optional(),
  recurringCron: z.string().optional(),
  timeoutSeconds: z.number().int().min(1).max(3600).default(30),
});
