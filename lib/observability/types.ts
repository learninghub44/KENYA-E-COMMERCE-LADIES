import { z } from "zod";

// ============================================================
// APPLICATION METRICS
// ============================================================

export interface AppMetric {
  id: number;
  metricName: string;
  metricValue: number;
  tags: Record<string, unknown>;
  recordedAt: string;
}

export interface RecordMetricInput {
  metricName: string;
  metricValue: number;
  tags?: Record<string, unknown>;
}

export interface AppMetricRepository {
  record(input: RecordMetricInput): Promise<void>;
  recordBatch(inputs: RecordMetricInput[]): Promise<void>;
  query(metricName: string, startDate: string, endDate: string): Promise<AppMetric[]>;
  getSummary(metricName: string, startDate: string, endDate: string): Promise<MetricSummary>;
}

export interface MetricSummary {
  metricName: string;
  count: number;
  average: number;
  min: number;
  max: number;
  sum: number;
  startDate: string;
  endDate: string;
}

// ============================================================
// DATABASE METRICS
// ============================================================

export interface DbMetric {
  id: number;
  querySource: string;
  queryCount: number;
  totalDurationMs: number;
  slowQueryCount: number;
  failedQueryCount: number;
  recordedAt: string;
}

export interface RecordDbMetricsInput {
  querySource?: string;
  queryCount: number;
  totalDurationMs: number;
  slowQueryCount?: number;
  failedQueryCount?: number;
}

export interface DbMetricRepository {
  record(input: RecordDbMetricsInput): Promise<void>;
  query(startDate: string, endDate: string): Promise<DbMetric[]>;
  getSummary(startDate: string, endDate: string): Promise<DbMetricSummary>;
}

export interface DbMetricSummary {
  totalQueries: number;
  avgDurationMs: number;
  totalSlowQueries: number;
  totalFailedQueries: number;
  errorRate: number;
}

// ============================================================
// CACHE METRICS
// ============================================================

export interface CacheMetric {
  id: number;
  cacheName: string;
  hits: number;
  misses: number;
  hitRatio: number;
  recordedAt: string;
}

export interface RecordCacheMetricsInput {
  cacheName?: string;
  hits: number;
  misses: number;
}

export interface CacheMetricRepository {
  record(input: RecordCacheMetricsInput): Promise<void>;
  query(cacheName: string, startDate: string, endDate: string): Promise<CacheMetric[]>;
  getSummary(cacheName: string, startDate: string, endDate: string): Promise<CacheMetricSummary>;
}

export interface CacheMetricSummary {
  cacheName: string;
  totalHits: number;
  totalMisses: number;
  avgHitRatio: number;
}

// ============================================================
// STORAGE METRICS
// ============================================================

export interface StorageMetric {
  id: number;
  storageType: string;
  totalImages: number;
  totalBytes: number;
  recordedAt: string;
}

export interface RecordStorageMetricsInput {
  storageType?: string;
  totalImages: number;
  totalBytes: number;
}

export interface StorageMetricRepository {
  record(input: RecordStorageMetricsInput): Promise<void>;
  query(startDate: string, endDate: string): Promise<StorageMetric[]>;
  getSummary(startDate: string, endDate: string): Promise<StorageMetricSummary>;
}

export interface StorageMetricSummary {
  storageType: string;
  totalImages: number;
  totalBytes: number;
  avgBytesPerImage: number;
}

// ============================================================
// QUEUE METRICS (future-ready)
// ============================================================

export interface QueueMetrics {
  queueName: string;
  depth: number;
  processingTimeMs: number;
  failedJobs: number;
  recordedAt: string;
}

export interface QueueMetricsCollector {
  collect(queueName: string): Promise<QueueMetrics>;
}

// ============================================================
// PERFORMANCE METRICS
// ============================================================

export interface PerformanceMetric {
  operation: string;
  durationMs: number;
  status: "success" | "failure";
  tags: Record<string, unknown>;
  timestamp: string;
}

export interface PerformanceTracker {
  startTimer(operation: string, tags?: Record<string, unknown>): PerformanceTimer;
  recordMetric(metric: PerformanceMetric): Promise<void>;
}

export interface PerformanceTimer {
  end(status?: "success" | "failure"): Promise<number>;
}

// ============================================================
// AUDIT METRICS (read-only view of audit_logs)
// ============================================================

export interface AuditMetric {
  action: string;
  entityType: string;
  count: number;
  period: string;
}

export interface AuditMetricsCollector {
  getAdminActions(startDate: string, endDate: string): Promise<AuditMetric[]>;
  getSellerActions(startDate: string, endDate: string): Promise<AuditMetric[]>;
  getAuthEvents(startDate: string, endDate: string): Promise<AuditMetric[]>;
  getModerationActions(startDate: string, endDate: string): Promise<AuditMetric[]>;
}

// ============================================================
// OBSERVABILITY COLLECTOR (unified interface)
// ============================================================

export interface ObservabilityCollector {
  app: AppMetricRepository;
  db: DbMetricRepository;
  cache: CacheMetricRepository;
  storage: StorageMetricRepository;
  queue: QueueMetricsCollector;
  audit: AuditMetricsCollector;
  performance: PerformanceTracker;
}

// ============================================================
// SCHEMAS
// ============================================================

export const recordMetricSchema = z.object({
  metricName: z.string().min(1).max(100),
  metricValue: z.number(),
  tags: z.record(z.unknown()).optional(),
});

export const recordDbMetricsSchema = z.object({
  querySource: z.string().default("unknown"),
  queryCount: z.number().int().min(0),
  totalDurationMs: z.number().int().min(0),
  slowQueryCount: z.number().int().min(0).default(0),
  failedQueryCount: z.number().int().min(0).default(0),
});

export const recordCacheMetricsSchema = z.object({
  cacheName: z.string().default("default"),
  hits: z.number().int().min(0),
  misses: z.number().int().min(0),
});

export const recordStorageMetricsSchema = z.object({
  storageType: z.string().default("cloudinary"),
  totalImages: z.number().int().min(0),
  totalBytes: z.number().int().min(0),
});
