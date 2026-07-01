export type RateLimitDecision = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

type Entry = {
  count: number;
  resetAt: number;
};

export function createFixedWindowRateLimiter(limit: number, windowMs: number) {
  const entries = new Map<string, Entry>();

  return {
    check(key: string, now = Date.now()): RateLimitDecision {
      const existing = entries.get(key);
      const entry = !existing || existing.resetAt <= now ? { count: 0, resetAt: now + windowMs } : existing;

      entry.count += 1;
      entries.set(key, entry);

      return {
        allowed: entry.count <= limit,
        remaining: Math.max(0, limit - entry.count),
        resetAt: entry.resetAt
      };
    }
  };
}
