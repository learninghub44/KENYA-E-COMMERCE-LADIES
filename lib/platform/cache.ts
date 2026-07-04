import { CacheMetrics } from "./types";

interface SupabaseResult {
  data: unknown;
  error: unknown;
}

interface EqChain extends Promise<SupabaseResult> {
  single: () => Promise<SupabaseResult>;
  eq: (col: string, val: unknown) => EqChain;
}

interface SelectChain extends Promise<SupabaseResult> {
  eq: (col: string, val: unknown) => EqChain;
  order: (col: string, opts: { ascending: boolean }) => { limit: (n: number) => Promise<SupabaseResult> };
}

interface CacheClient {
  from: (table: string) => {
    select: (columns: string) => SelectChain;
    insert: (values: Record<string, unknown>) => { select: () => Promise<SupabaseResult> };
    upsert: (values: Record<string, unknown>, opts: { onConflict: string }) => { select: () => Promise<SupabaseResult> };
    delete: () => { eq: (col: string, val: unknown) => Promise<SupabaseResult> };
  };
  rpc: (name: string, params?: Record<string, unknown>) => Promise<SupabaseResult>;
}

export interface CacheDependencies {
  supabaseClient?: CacheClient;
  onMetrics?: (metrics: Partial<CacheMetrics>) => void;
}

export interface Cache {
  get<T>(key: string, namespace?: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number, namespace?: string): Promise<void>;
  delete(key: string, namespace?: string): Promise<void>;
  clear(namespace?: string): Promise<void>;
  getOrSet<T>(key: string, factory: () => Promise<T>, ttlSeconds?: number, namespace?: string): Promise<T>;
  getMetrics(): CacheMetrics;
}

const DEFAULT_TTL_SECONDS = 300;

interface MemoryEntry {
  value: unknown;
  expiresAt: number | null;
}

export function createCache(deps?: CacheDependencies): Cache {
  const store = new Map<string, MemoryEntry>();
  const stats = { hits: 0, misses: 0, sets: 0, evictions: 0 };

  function buildKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  function isExpired(entry: MemoryEntry): boolean {
    return entry.expiresAt !== null && entry.expiresAt <= Date.now();
  }

  function getMetrics(): CacheMetrics {
    return { ...stats, size: store.size };
  }

  function emitMetrics(delta: Partial<CacheMetrics>): void {
    if (deps?.onMetrics) {
      deps.onMetrics(delta);
    }
  }

  async function get<T>(key: string, namespace?: string): Promise<T | null> {
    const k = buildKey(key, namespace);
    const entry = store.get(k);

    if (entry && isExpired(entry)) {
      store.delete(k);
      stats.evictions++;
      emitMetrics({ evictions: 1 });
      stats.misses++;
      emitMetrics({ misses: 1 });
      return null;
    }

    if (entry) {
      stats.hits++;
      emitMetrics({ hits: 1 });
      return entry.value as T;
    }

    if (deps?.supabaseClient) {
      const { data, error } = await deps.supabaseClient
        .from("platform_cache_entries")
        .select("cache_value, expires_at")
        .eq("cache_key", k)
        .single();

      if (!error && data) {
        const row = data as Record<string, unknown>;
        const expiresAt = row.expires_at ? new Date(row.expires_at as string).getTime() : null;

        if (expiresAt && expiresAt < Date.now()) {
          await deps.supabaseClient.from("platform_cache_entries").delete().eq("cache_key", k);
          stats.misses++;
          emitMetrics({ misses: 1 });
          return null;
        }

        const entry: MemoryEntry = {
          value: row.cache_value,
          expiresAt,
        };
        store.set(k, entry);
        stats.hits++;
        emitMetrics({ hits: 1 });
        return entry.value as T;
      }
    }

    stats.misses++;
    emitMetrics({ misses: 1 });
    return null;
  }

  async function set<T>(key: string, value: T, ttlSeconds?: number, namespace?: string): Promise<void> {
    const k = buildKey(key, namespace);
    const ttl = ttlSeconds ?? DEFAULT_TTL_SECONDS;
    const ms = ttl > 0 ? ttl * 1000 : ttl === 0 ? 0 : null;
    const expiresAt = ms !== null ? Date.now() + ms : null;

    store.set(k, { value, expiresAt });
    stats.sets++;
    emitMetrics({ sets: 1 });

    if (deps?.supabaseClient) {
      const entry = {
        cache_key: k,
        cache_namespace: namespace ?? "default",
        cache_value: value as Record<string, unknown>,
        ttl_seconds: ttl > 0 ? ttl : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      };
      await deps.supabaseClient
        .from("platform_cache_entries")
        .upsert(entry, { onConflict: "cache_namespace, cache_key" })
        .select();
    }
  }

  async function getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds?: number,
    namespace?: string,
  ): Promise<T> {
    const existing = await get<T>(key, namespace);
    if (existing !== null) return existing;
    const value = await factory();
    await set(key, value, ttlSeconds, namespace);
    return value;
  }

  async function delete_(key: string, namespace?: string): Promise<void> {
    const k = buildKey(key, namespace);
    store.delete(k);
    stats.evictions++;
    emitMetrics({ evictions: 1 });

    if (deps?.supabaseClient) {
      await deps.supabaseClient.from("platform_cache_entries").delete().eq("cache_key", k);
    }
  }

  async function clear(namespace?: string): Promise<void> {
    if (namespace) {
      const prefix = `${namespace}:`;
      for (const key of store.keys()) {
        if (key.startsWith(prefix)) {
          store.delete(key);
        }
      }
    } else {
      store.clear();
    }

    if (deps?.supabaseClient) {
      if (namespace) {
        await deps.supabaseClient
          .from("platform_cache_entries")
          .delete()
          .eq("cache_namespace", namespace);
      } else {
        await deps.supabaseClient.rpc("platform_clear_expired_cache");
      }
    }
  }

  return {
    get,
    set,
    delete: delete_,
    clear,
    getOrSet,
    getMetrics,
  };
}
