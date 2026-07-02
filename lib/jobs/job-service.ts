import { CreateJobInput, createJobSchema, JobHandler, JobRecord, JobRepository, JobService, JobStatus } from "./types";

export interface JobServiceDependencies {
  repository: JobRepository;
}

export function createJobService(deps: JobServiceDependencies): JobService {
  const { repository } = deps;
  const handlers = new Map<string, JobHandler>();

  return {
    async enqueue(input: CreateJobInput): Promise<JobRecord> {
      const parsed = createJobSchema.parse(input);
      return repository.create(parsed);
    },

    async processNext(queue: string): Promise<boolean> {
      const job = await repository.claimNext(queue);
      if (!job) return false;

      const handler = handlers.get(job.jobType);
      if (!handler) {
        await repository.complete(job.id, `No handler registered for job type '${job.jobType}'`);
        return true;
      }

      try {
        await handler.execute(job.payload, job);
        await repository.complete(job.id);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        await repository.complete(job.id, errorMessage);
      }

      return true;
    },

    registerHandler(handler: JobHandler): void {
      handlers.set(handler.jobType, handler);
    },

    async getJob(jobId: string): Promise<JobRecord | null> {
      return repository.getById(jobId);
    },

    async listJobs(filters: { status?: JobStatus; queue?: string; jobType?: string }, cursor?: string, limit?: number) {
      return repository.list(filters, cursor, limit);
    },

    async cancelJob(jobId: string): Promise<void> {
      return repository.cancel(jobId);
    },

    async retryJob(jobId: string): Promise<void> {
      return repository.retryDeadLetter(jobId);
    },

    async retryAll(queue?: string): Promise<number> {
      return repository.retryAllDeadLetters(queue);
    },
  };
}
