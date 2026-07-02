# Resilience Feature

Reusable resilience utilities for fault-tolerant service integration.

## Utilities

- **Retry** — configurable retry with exponential backoff and jitter
- **Circuit Breaker** — failure threshold, open/half-open/closed states, auto-recovery
- **Timeout** — configurable operation timeout with clean cancellation
- **Bulkhead** — max concurrent execution with bounded queue

All utilities are framework-agnostic and work with any async function.
