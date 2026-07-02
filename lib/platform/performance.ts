import { PaginationInput, PaginationResult } from "./types.js";

export interface ConnectionPoolOptions {
  maxConnections: number;
  idleTimeoutMs: number;
  maxRetries: number;
}

export interface RequestBatcherOptions {
  maxBatchSize: number;
  batchWindowMs: number;
}

export interface RequestBatcher<T, R> {
  add(item: T): Promise<R>;
  flush(): Promise<void>;
  size(): number;
}

export function createRequestBatcher<T, R>(
  handler: (items: T[]) => Promise<R[]>,
  options?: Partial<RequestBatcherOptions>,
): RequestBatcher<T, R> {
  const opts: RequestBatcherOptions = {
    maxBatchSize: options?.maxBatchSize ?? 100,
    batchWindowMs: options?.batchWindowMs ?? 50,
  };

  let queue: Array<{ item: T; resolve: (value: R) => void; reject: (err: Error) => void }> = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  async function processBatch(): Promise<void> {
    const batch = queue.splice(0, opts.maxBatchSize);
    queue = [];
    timer = null;

    try {
      const results = await handler(batch.map((entry) => entry.item));
      for (let i = 0; i < batch.length; i++) {
        batch[i]?.resolve(results[i] as R);
      }
    } catch (error) {
      for (const entry of batch) {
        entry.reject(error instanceof Error ? error : new Error("Batch processing failed"));
      }
    }
  }

  function schedule(): void {
    if (timer) return;
    if (queue.length >= opts.maxBatchSize) {
      processBatch();
      return;
    }
    timer = setTimeout(processBatch, opts.batchWindowMs);
  }

  async function add(item: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      queue.push({ item, resolve, reject });
      schedule();
    });
  }

  async function flush(): Promise<void> {
    if (queue.length > 0) {
      await processBatch();
    }
  }

  function size(): number {
    return queue.length;
  }

  return { add, flush, size };
}

export interface LazyLoader<T> {
  get(): T;
  reset(): void;
  loaded: boolean;
}

export function createLazyLoader<T>(factory: () => T): LazyLoader<T> {
  let instance: T | null = null;
  let loaded = false;

  return {
    get(): T {
      if (!loaded) {
        instance = factory();
        loaded = true;
      }
      return instance as T;
    },
    reset(): void {
      instance = null;
      loaded = false;
    },
    get loaded(): boolean {
      return loaded;
    },
  };
}

export function paginate<T>(
  items: T[],
  input: PaginationInput,
  keyFn: (item: T) => string,
): PaginationResult<T> {
  const limit = input.limit ?? 50;
  let filtered = items;

  if (input.cursor) {
    const cursorIndex = items.findIndex((item) => keyFn(item) === input.cursor);
    if (cursorIndex >= 0) {
      filtered = items.slice(cursorIndex + 1);
    }
  }

  const page = filtered.slice(0, limit);
  const nextCursor = page.length === limit ? keyFn(page[page.length - 1] as T) : null;

  return { data: page, nextCursor, total: items.length };
}

export function compressInput<T>(input: T, fields: (keyof T)[]): Partial<T> {
  const compressed: Partial<T> = {};
  for (const field of fields) {
    compressed[field] = input[field];
  }
  return compressed;
}

export function batchArray<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}
