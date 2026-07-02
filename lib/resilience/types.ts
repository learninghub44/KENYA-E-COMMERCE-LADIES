export type CircuitState = "closed" | "open" | "half_open";

export interface CircuitBreakerOptions {
  failureThreshold: number;
  successThreshold: number;
  openTimeoutMs: number;
  halfOpenMaxRequests?: number;
}

export interface BulkheadOptions {
  maxConcurrent: number;
  maxQueueSize: number;
}

export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitter?: boolean;
}

export interface TimeoutOptions {
  timeoutMs: number;
}

export interface RetryResult<T> {
  ok: boolean;
  value?: T;
  error?: Error | undefined;
  attempts: number;
}
