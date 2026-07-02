# Jobs Feature

Background job processing framework using Supabase as the queue backend.

## Queues

- `default` — general purpose
- `search` — search indexing
- `email` — email delivery
- `analytics` — data aggregation
- `media` — media processing
- `cleanup` — scheduled cleanup
- `verification` — seller/user verification
- `cache` — cache warming/clearing

## Architecture

- `JobRepository` — Supabase-backed persistence with row-level locking (`SELECT ... FOR UPDATE SKIP LOCKED`)
- `JobService` — handler registry, enqueue, process, retry
- RPC functions `platform_claim_next_job` and `platform_complete_job` handle atomic state transitions

## Job Lifecycle

`pending → running → completed | failed (→ dead_letter after max attempts)`
