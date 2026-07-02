# System Diagnostics

## Overview

Generates comprehensive health reports covering all platform subsystems.

## Report Sections

| Section      | Description                          |
|--------------|--------------------------------------|
| Environment  | Node version, platform, env config   |
| Storage      | Per-provider storage health checks   |
| Database     | Database connectivity and latency     |
| Search       | Search service availability           |
| Analytics    | Analytics pipeline health            |
| Jobs         | Queue health and job system status   |

## API

`GET /internal/platform/diagnostics` — returns full diagnostics report

## Usage

```typescript
const diagnostics = createDiagnosticsService({
  runStorageCheck: async () => [/*...*/],
  runDatabaseCheck: async () => ({ /*...*/ }),
});
const report = await diagnostics.generate();
```
