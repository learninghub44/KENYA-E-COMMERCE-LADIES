import { BulkheadOptions } from "./types";

export interface Bulkhead {
  execute<T>(fn: () => Promise<T>): Promise<T>;
  getQueueSize(): number;
  getActiveCount(): number;
}

export function createBulkhead(options: Partial<BulkheadOptions> = {}): Bulkhead {
  const opts: BulkheadOptions = {
    maxConcurrent: options.maxConcurrent ?? 10,
    maxQueueSize: options.maxQueueSize ?? 100,
  };

  let activeCount = 0;
  const queue: Array<{ fn: () => Promise<unknown>; resolve: (value: unknown) => void; reject: (err: Error) => void }> = [];

  async function runNext(): Promise<void> {
    if (queue.length === 0 || activeCount >= opts.maxConcurrent) return;

    const entry = queue.shift();
    if (!entry) return;

    activeCount++;
    try {
      const result = await entry.fn();
      entry.resolve(result);
    } catch (error) {
      entry.reject(error instanceof Error ? error : new Error(String(error)));
    } finally {
      activeCount--;
      runNext();
    }
  }

  async function execute<T>(fn: () => Promise<T>): Promise<T> {
    if (activeCount < opts.maxConcurrent) {
      activeCount++;
      try {
        return await fn();
      } finally {
        activeCount--;
        runNext();
      }
    }

    if (queue.length >= opts.maxQueueSize) {
      throw new Error("Bulkhead queue is full");
    }

    return new Promise<T>((resolve, reject) => {
      queue.push({ fn: fn as () => Promise<unknown>, resolve: resolve as (v: unknown) => void, reject: reject as (err: Error) => void });
      runNext();
    });
  }

  return {
    execute,
    getQueueSize: () => queue.length,
    getActiveCount: () => activeCount,
  };
}
