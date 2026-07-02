import { RateLimitResult } from "./types.js";

export type RateLimitType = "user" | "seller" | "admin" | "api" | "ip";

export interface RateLimitInput {
  limitType: RateLimitType;
  limitKey: string;
  windowSeconds?: number;
  maxRequests?: number;
}

export interface RateLimitDependencies {
  supabaseClient?: {
    rpc: (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
  };
  store?: Map<string, { count: number; windowStart: number; maxRequests: number; windowSeconds: number }>;
}

export interface RateLimitService {
  check(input: RateLimitInput): Promise<RateLimitResult>;
  increment(input: RateLimitInput): Promise<RateLimitResult>;
  reset(limitType: RateLimitType, limitKey: string): Promise<void>;
}

export function createRateLimitService(deps?: RateLimitDependencies): RateLimitService {
  const memoryStore = deps?.store ?? new Map();

  function buildKey(limitType: string, limitKey: string): string {
    return `${limitType}:${limitKey}`;
  }

  async function check(input: RateLimitInput): Promise<RateLimitResult> {
    const key = buildKey(input.limitType, input.limitKey);
    const windowSeconds = input.windowSeconds ?? 60;
    const maxRequests = input.maxRequests ?? 100;
    const windowStart = Math.floor(Date.now() / (windowSeconds * 1000)) * (windowSeconds * 1000);

    if (deps?.supabaseClient) {
      const { data, error } = await deps.supabaseClient.rpc("platform_get_rate_limit", {
        p_limit_type: input.limitType,
        p_limit_key: input.limitKey,
        p_window_seconds: windowSeconds,
      });

      if (!error && data) {
        const row = (data as Record<string, unknown>[])[0];
        if (row) {
          return {
            allowed: (row.current_count as number) < (row.max_requests as number),
            currentCount: row.current_count as number,
            maxRequests: row.max_requests as number,
            remaining: row.remaining as number,
            resetAt: row.reset_at as string,
          };
        }
      }
    }

    const entry = memoryStore.get(key) as { count: number; windowStart: number; maxRequests: number; windowSeconds: number } | undefined;

    if (!entry || entry.windowStart !== windowStart) {
      return {
        allowed: true,
        currentCount: 0,
        maxRequests,
        remaining: maxRequests,
        resetAt: new Date(windowStart + windowSeconds * 1000).toISOString(),
      };
    }

    return {
      allowed: entry.count < entry.maxRequests,
      currentCount: entry.count,
      maxRequests: entry.maxRequests,
      remaining: Math.max(0, entry.maxRequests - entry.count),
      resetAt: new Date(entry.windowStart + entry.windowSeconds * 1000).toISOString(),
    };
  }

  async function increment(input: RateLimitInput): Promise<RateLimitResult> {
    const windowSeconds = input.windowSeconds ?? 60;
    const maxRequests = input.maxRequests ?? 100;
    const windowStart = Math.floor(Date.now() / (windowSeconds * 1000)) * (windowSeconds * 1000);

    if (deps?.supabaseClient) {
      const { data, error } = await deps.supabaseClient.rpc("platform_increment_rate_limit", {
        p_limit_type: input.limitType,
        p_limit_key: input.limitKey,
        p_window_seconds: windowSeconds,
        p_max_requests: maxRequests,
      });

      if (!error) {
        const result = await check(input);
        return result;
      }
    }

    const key = buildKey(input.limitType, input.limitKey);
    const entry = memoryStore.get(key) as { count: number; windowStart: number; maxRequests: number; windowSeconds: number } | undefined;

    if (!entry || entry.windowStart !== windowStart) {
      memoryStore.set(key, { count: 1, windowStart, maxRequests, windowSeconds });
      return {
        allowed: true,
        currentCount: 1,
        maxRequests,
        remaining: maxRequests - 1,
        resetAt: new Date(windowStart + windowSeconds * 1000).toISOString(),
      };
    }

    entry.count++;
    return {
      allowed: entry.count <= entry.maxRequests,
      currentCount: entry.count,
      maxRequests: entry.maxRequests,
      remaining: Math.max(0, entry.maxRequests - entry.count),
      resetAt: new Date(entry.windowStart + entry.windowSeconds * 1000).toISOString(),
    };
  }

  async function reset(limitType: RateLimitType, limitKey: string): Promise<void> {
    memoryStore.delete(buildKey(limitType, limitKey));
  }

  return { check, increment, reset };
}
