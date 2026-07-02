import { TimeoutOptions } from "./types.js";

export interface TimeoutStrategy {
  execute<T>(fn: () => Promise<T>): Promise<T>;
}

export function createTimeoutStrategy(options: Partial<TimeoutOptions> = {}): TimeoutStrategy {
  const opts: TimeoutOptions = {
    timeoutMs: options.timeoutMs ?? 5000,
  };

  async function execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${opts.timeoutMs}ms`));
      }, opts.timeoutMs);

      fn().then(
        (result) => {
          clearTimeout(timer);
          resolve(result);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        },
      );
    });
  }

  return { execute };
}
