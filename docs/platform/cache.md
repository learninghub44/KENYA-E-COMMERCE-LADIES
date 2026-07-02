# Cache Platform Service

## Overview

The cache service provides a dual-layer caching system:
- **In-memory** `Map` — fast, ephemeral, per-instance
- **Persistent** (Supabase `platform_cache_entries` table) — shared across instances, optional

## API

```typescript
interface Cache {
  get<T>(key: string, namespace?: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number, namespace?: string): Promise<void>;
  delete(key: string, namespace?: string): Promise<void>;
  clear(namespace?: string): Promise<void>;
  getOrSet<T>(key: string, factory: () => Promise<T>, ttlSeconds?: number, namespace?: string): Promise<T>;
  getMetrics(): CacheMetrics;
}
```

## Usage

```typescript
import { createCache } from "../lib/platform/index.js";

const cache = createCache();

// Simple set/get
await cache.set("user:123", { name: "Alice" }, 300);
const user = await cache.get("user:123");

// With namespace
await cache.set("config", { theme: "dark" }, undefined, "appearance");

// getOrSet — fetch once, cache subsequent calls
const data = await cache.getOrSet("expensive-query", () => fetchData(), 60);
```

## TTL

- `ttlSeconds = 0` — immediate expiry (write-only)
- `ttlSeconds = null/undefined` — defaults to 300 seconds
- Expired entries are evicted lazily on read

## Metrics

```typescript
const metrics = cache.getMetrics();
// { hits: number, misses: number, sets: number, evictions: number, size: number }
```
