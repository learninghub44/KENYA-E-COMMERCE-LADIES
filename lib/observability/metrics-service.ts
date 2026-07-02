import {
  AppMetricRepository,
  CacheMetricRepository,
  DbMetricRepository,
  ObservabilityCollector,
  PerformanceMetric,
  PerformanceTimer,
  PerformanceTracker,
  RecordCacheMetricsInput,
  RecordDbMetricsInput,
  RecordMetricInput,
  RecordStorageMetricsInput,
  StorageMetricRepository,
} from "./types";

export interface MetricsRepositoryClient {
  from: (table: string) => {
    insert: (values: Record<string, unknown> | Record<string, unknown>[]) => Promise<{ error: unknown }>;
    select: (columns: string) => {
      order: (col: string, opts: { ascending: boolean }) => {
        gte: (col: string, val: unknown) => {
          lte: (col: string, val: unknown) => Promise<{ data: unknown; error: unknown }>;
        };
      };
      gte: (col: string, val: unknown) => {
        lte: (col: string, val: unknown) => Promise<{ data: unknown; error: unknown }>;
      };
    };
  };
}

export function createAppMetricRepository(client: MetricsRepositoryClient): AppMetricRepository {
  return {
    async record(input: RecordMetricInput): Promise<void> {
      const { error } = await client.from("app_metrics").insert({
        metric_name: input.metricName,
        metric_value: input.metricValue,
        tags: input.tags ?? {},
      });
      if (error) throw new Error(`Failed to record app metric: ${JSON.stringify(error)}`);
    },

    async recordBatch(inputs: RecordMetricInput[]): Promise<void> {
      const rows = inputs.map((i) => ({
        metric_name: i.metricName,
        metric_value: i.metricValue,
        tags: i.tags ?? {},
      }));
      const { error } = await client.from("app_metrics").insert(rows);
      if (error) throw new Error(`Failed to record batch metrics: ${JSON.stringify(error)}`);
    },

    async query(metricName: string, startDate: string, endDate: string) {
      const result = await client
        .from("app_metrics")
        .select("*")
        .gte("recorded_at", startDate)
        .lte("recorded_at", endDate);
      const { data, error } = result as { data: unknown; error: unknown };

      if (error) throw new Error(`Failed to query app metrics: ${JSON.stringify(error)}`);
      return (data as Array<Record<string, unknown>>)?.map((r) => ({
        id: r.id as number,
        metricName: r.metric_name as string,
        metricValue: r.metric_value as number,
        tags: r.tags as Record<string, unknown>,
        recordedAt: r.recorded_at as string,
      })) ?? [];
    },

    async getSummary(metricName: string, startDate: string, endDate: string) {
      const records = await this.query(metricName, startDate, endDate);
      const values = records.map((r) => r.metricValue);
      return {
        metricName,
        count: values.length,
        average: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
        min: values.length > 0 ? Math.min(...values) : 0,
        max: values.length > 0 ? Math.max(...values) : 0,
        sum: values.reduce((a, b) => a + b, 0),
        startDate,
        endDate,
      };
    },
  };
}

export function createDbMetricRepository(client: MetricsRepositoryClient): DbMetricRepository {
  return {
    async record(input: RecordDbMetricsInput): Promise<void> {
      const { error } = await client.from("db_metrics").insert({
        query_source: input.querySource ?? "unknown",
        query_count: input.queryCount,
        total_duration_ms: input.totalDurationMs,
        slow_query_count: input.slowQueryCount ?? 0,
        failed_query_count: input.failedQueryCount ?? 0,
      });
      if (error) throw new Error(`Failed to record db metric: ${JSON.stringify(error)}`);
    },

    async query(startDate: string, endDate: string) {
      const result = await client
        .from("db_metrics")
        .select("*")
        .gte("recorded_at", startDate)
        .lte("recorded_at", endDate);
      const { data, error } = result as { data: unknown; error: unknown };

      if (error) throw new Error(`Failed to query db metrics: ${JSON.stringify(error)}`);
      return (data as Array<Record<string, unknown>>)?.map((r) => ({
        id: r.id as number,
        querySource: r.query_source as string,
        queryCount: r.query_count as number,
        totalDurationMs: r.total_duration_ms as number,
        slowQueryCount: r.slow_query_count as number,
        failedQueryCount: r.failed_query_count as number,
        recordedAt: r.recorded_at as string,
      })) ?? [];
    },

    async getSummary(startDate: string, endDate: string) {
      const records = await this.query(startDate, endDate);
      const totalQueries = records.reduce((s, r) => s + r.queryCount, 0);
      const totalDuration = records.reduce((s, r) => s + r.totalDurationMs, 0);
      const totalSlow = records.reduce((s, r) => s + r.slowQueryCount, 0);
      const totalFailed = records.reduce((s, r) => s + r.failedQueryCount, 0);

      return {
        totalQueries,
        avgDurationMs: totalQueries > 0 ? totalDuration / totalQueries : 0,
        totalSlowQueries: totalSlow,
        totalFailedQueries: totalFailed,
        errorRate: totalQueries > 0 ? (totalFailed / totalQueries) * 100 : 0,
      };
    },
  };
}

export function createCacheMetricRepository(client: MetricsRepositoryClient): CacheMetricRepository {
  return {
    async record(input: RecordCacheMetricsInput): Promise<void> {
      const hitRatio = input.hits + input.misses > 0 ? input.hits / (input.hits + input.misses) : 0;
      const { error } = await client.from("cache_metrics").insert({
        cache_name: input.cacheName ?? "default",
        hits: input.hits,
        misses: input.misses,
        hit_ratio: hitRatio,
      });
      if (error) throw new Error(`Failed to record cache metric: ${JSON.stringify(error)}`);
    },

    async query(cacheName: string, startDate: string, endDate: string) {
      const result = await client
        .from("cache_metrics")
        .select("*")
        .gte("recorded_at", startDate)
        .lte("recorded_at", endDate);
      const { data, error } = result as { data: unknown; error: unknown };

      if (error) throw new Error(`Failed to query cache metrics: ${JSON.stringify(error)}`);
      return (data as Array<Record<string, unknown>>)?.filter((r) => r.cache_name === cacheName).map((r) => ({
        id: r.id as number,
        cacheName: r.cache_name as string,
        hits: r.hits as number,
        misses: r.misses as number,
        hitRatio: r.hit_ratio as number,
        recordedAt: r.recorded_at as string,
      })) ?? [];
    },

    async getSummary(cacheName: string, startDate: string, endDate: string) {
      const records = await this.query(cacheName, startDate, endDate);
      const totalHits = records.reduce((s, r) => s + r.hits, 0);
      const totalMisses = records.reduce((s, r) => s + r.misses, 0);
      return {
        cacheName,
        totalHits,
        totalMisses,
        avgHitRatio: totalHits + totalMisses > 0 ? totalHits / (totalHits + totalMisses) : 0,
      };
    },
  };
}

export function createStorageMetricRepository(client: MetricsRepositoryClient): StorageMetricRepository {
  return {
    async record(input: RecordStorageMetricsInput): Promise<void> {
      const { error } = await client.from("storage_metrics").insert({
        storage_type: input.storageType ?? "cloudinary",
        total_images: input.totalImages,
        total_bytes: input.totalBytes,
      });
      if (error) throw new Error(`Failed to record storage metric: ${JSON.stringify(error)}`);
    },

    async query(startDate: string, endDate: string) {
      const result = await client
        .from("storage_metrics")
        .select("*")
        .gte("recorded_at", startDate)
        .lte("recorded_at", endDate);
      const { data, error } = result as { data: unknown; error: unknown };

      if (error) throw new Error(`Failed to query storage metrics: ${JSON.stringify(error)}`);
      return (data as Array<Record<string, unknown>>)?.map((r) => ({
        id: r.id as number,
        storageType: r.storage_type as string,
        totalImages: r.total_images as number,
        totalBytes: r.total_bytes as number,
        recordedAt: r.recorded_at as string,
      })) ?? [];
    },

    async getSummary(startDate: string, endDate: string) {
      const records = await this.query(startDate, endDate);
      const totalImages = records.reduce((s, r) => s + r.totalImages, 0);
      const totalBytes = records.reduce((s, r) => s + r.totalBytes, 0);
      return {
        storageType: "cloudinary",
        totalImages,
        totalBytes,
        avgBytesPerImage: totalImages > 0 ? totalBytes / totalImages : 0,
      };
    },
  };
}

export function createPerformanceTracker(): PerformanceTracker {
  return {
    startTimer(operation: string, tags?: Record<string, unknown>): PerformanceTimer {
      const start = Date.now();
      return {
        async end(status: "success" | "failure" = "success"): Promise<number> {
          const duration = Date.now() - start;
          const metric: PerformanceMetric = { operation, durationMs: duration, status, tags: tags ?? {}, timestamp: new Date().toISOString() };
          return duration;
        },
      };
    },
    async recordMetric(_metric: PerformanceMetric): Promise<void> {
    },
  };
}

export function createQueueMetricsCollector(): import("./types.js").QueueMetricsCollector {
  return {
    async collect(queueName: string) {
      return {
        queueName,
        depth: 0,
        processingTimeMs: 0,
        failedJobs: 0,
        recordedAt: new Date().toISOString(),
      };
    },
  };
}

export function createAuditMetricsCollector(client: MetricsRepositoryClient): import("./types.js").AuditMetricsCollector {
  return {
    async getAdminActions(_startDate: string, _endDate: string) { return []; },
    async getSellerActions(_startDate: string, _endDate: string) { return []; },
    async getAuthEvents(_startDate: string, _endDate: string) { return []; },
    async getModerationActions(_startDate: string, _endDate: string) { return []; },
  };
}

export function createObservabilityCollector(client: MetricsRepositoryClient): ObservabilityCollector {
  return {
    app: createAppMetricRepository(client),
    db: createDbMetricRepository(client),
    cache: createCacheMetricRepository(client),
    storage: createStorageMetricRepository(client),
    queue: createQueueMetricsCollector(),
    audit: createAuditMetricsCollector(client),
    performance: createPerformanceTracker(),
  };
}
