# Resilience Framework

## Retry Strategy

```typescript
const retry = createRetryStrategy({ maxAttempts: 3, baseDelayMs: 1000 });
const result = await retry.execute(() => fetchData());
// { ok: boolean, value?: T, error?: Error, attempts: number }
```

Supports exponential backoff and jitter.

## Circuit Breaker

```typescript
const cb = createCircuitBreaker({
  failureThreshold: 5,
  successThreshold: 3,
  openTimeoutMs: 30000,
});

await cb.call(() => unstableService());
// Throws "Circuit breaker is open" when open
```

States: `closed → open → half_open → closed`

## Timeout

```typescript
const timeout = createTimeoutStrategy({ timeoutMs: 5000 });
await timeout.execute(() => slowQuery());
// Throws "Operation timed out after 5000ms"
```

## Bulkhead

```typescript
const bulkhead = createBulkhead({
  maxConcurrent: 10,
  maxQueueSize: 100,
});

await bulkhead.execute(() => expensiveOp());
// Throws "Bulkhead queue is full" when at capacity
```
