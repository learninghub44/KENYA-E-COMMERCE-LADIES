import { RetryOptions, RetryResult } from "./types.js";

export interface RetryStrategy {
  execute<T>(fn: () => Promise<T>): Promise<RetryResult<T>>;
}

function calculateDelay(attempt: number, options: RetryOptions): number {
  const exponential = Math.min(options.baseDelayMs * Math.pow(2, attempt - 1), options.maxDelayMs);

  if (options.jitter) {
    const jitterAmount = exponential * 0.2;
    return exponential + Math.random() * jitterAmount * 2 - jitterAmount;
  }

  return exponential;
}

export function createRetryStrategy(options: Partial<RetryOptions> = {}): RetryStrategy {
  const opts: RetryOptions = {
    maxAttempts: options.maxAttempts ?? 3,
    baseDelayMs: options.baseDelayMs ?? 1000,
    maxDelayMs: options.maxDelayMs ?? 30000,
    jitter: options.jitter ?? true,
  };

  async function execute<T>(fn: () => Promise<T>): Promise<RetryResult<T>> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
      try {
        const value = await fn();
        return { ok: true, value, attempts: attempt };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < opts.maxAttempts) {
          const delay = calculateDelay(attempt, opts);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    return { ok: false, error: lastError, attempts: opts.maxAttempts };
  }

  return { execute };
}
