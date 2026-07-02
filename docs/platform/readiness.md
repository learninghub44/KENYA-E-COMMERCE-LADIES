# Readiness Checks

## Overview

Readiness checks validate that the platform is ready to serve traffic. Required checks must all pass; optional checks may fail without blocking readiness.

## Built-in Checks

| Check       | Factory                       | Required |
|-------------|-------------------------------|----------|
| Environment | `createEnvReadinessCheck`     | yes      |
| Database    | `createConnectivityReadinessCheck` | yes |
| Cache       | `createConnectivityReadinessCheck` | no  |
| Storage     | `createConnectivityReadinessCheck` | no  |

## API

- `GET /internal/platform/readiness` — returns readiness report
- Status 200 when ready, 503 when not ready
