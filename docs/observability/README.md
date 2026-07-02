# Observability Documentation

## Overview
The observability module provides interfaces for collecting and querying metrics across application, database, cache, storage, queue, performance, and audit domains.

## Architecture

```
Collector / Tracker
  -> MetricRepository (abstract interface)
    -> Supabase-backed implementation
      -> app_metrics, db_metrics, cache_metrics, storage_metrics tables
```

## Database Tables
- `app_metrics` — Application-level metrics (request count, latency, error rates, memory usage, active users)
- `db_metrics` — Database query performance metrics
- `cache_metrics` — Cache hit/miss ratio tracking
- `storage_metrics` — Storage usage tracking (images, CDN, files)

## Key Interfaces

### AppMetricRepository
- `record(metric: CreateAppMetricInput): Promise<void>`
- `recordBatch(metrics: CreateAppMetricInput[]): Promise<void>`
- `query(name, startDate, endDate): Promise<AppMetricRecord[]>`
- `getSummary(name, startDate, endDate): Promise<MetricSummary>`

### DbMetricRepository
- `record(metric: CreateDbMetricInput): Promise<void>`
- `getSummary(startDate, endDate): Promise<DbMetricSummary>`

### CacheMetricRepository
- `record(metric: CreateCacheMetricInput): Promise<void>`
- `getSummary(cacheName, startDate, endDate): Promise<CacheMetricSummary>`

### StorageMetricRepository
- `record(metric: CreateStorageMetricInput): Promise<void>`
- `getSummary(startDate, endDate): Promise<StorageMetricSummary>`

### PerformanceTracker
- `startTimer(operation: string): { end: () => number }`
- `mark(name: string): void`
- `measure(from: string, to: string): number`

## External Integration Points
Ready for Grafana, Sentry, Datadog, Prometheus via the repository pattern — implement `AppMetricRepository` interface against any backend.

## Key Files
- `lib/observability/types.ts` — Type definitions
- `lib/observability/metrics-service.ts` — Repository implementations, performance tracker

## Future Work (Agent 12+)
- Queue metrics collector
- Audit metric collector
- Web vitals collector
- Grafana dashboard templates
- Prometheus endpoint integration
