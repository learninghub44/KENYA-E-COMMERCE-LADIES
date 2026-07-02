# Platform Feature

Internal platform infrastructure providing shared services across the marketplace.

## Modules

- **Cache** — in-memory + persistent (Supabase) cache with namespaces, TTL, and metrics
- **Config** — typed runtime config with env fallback, feature flags, and secret management
- **Files** — file tracking, orphan detection, storage metrics, cleanup
- **Jobs** — background job queue with retry, dead letter, and recurring schedules (see `lib/jobs`)

## Usage

Import from `lib/platform`:

```typescript
import { createCache, createConfigService, createFileService } from "../lib/platform/index.js";
```

All services use dependency injection for testability. Supabase client is optional where noted.
