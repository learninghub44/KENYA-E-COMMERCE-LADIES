# Health Engine

## Overview

The health engine aggregates checks across all platform services and returns a unified report with healthy/warning/critical status.

## Built-in Checks

| Check       | Factory Function              | Status on Failure |
|-------------|-------------------------------|-------------------|
| Database    | `createDatabaseHealthCheck`   | critical          |
| Storage     | `createStorageHealthCheck`    | critical          |
| Cache       | `createCacheHealthCheck`      | warning           |
| Queue       | `createQueueHealthCheck`      | critical          |
| HTTP        | `createHttpHealthCheck`       | varies            |

## Custom Checks

```typescript
health.registerCheck({
  name: "my-service",
  async check() {
    return {
      service: "my-service",
      status: "healthy",
      message: "All good",
      latencyMs: 5,
      checkedAt: new Date().toISOString(),
    };
  },
});
```

## API

- `GET /internal/platform/health` — returns full health report
- Overall status: 200 for healthy/warning, 503 for critical
