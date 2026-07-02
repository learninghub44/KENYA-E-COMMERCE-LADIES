# Scaling Guide

## Overview

This document outlines the scaling strategy for the Kenya E-Commerce Ladies platform targeting 1M+ users, 50K+ daily active users, and 10K+ daily orders.

## Database Scaling

### Connection Pooling (PgBouncer)

**Current Setup**:
- PgBouncer deployed as sidecar in Supabase
- Transaction mode enabled for web requests
- Session mode for long-running admin queries

**Configuration**:

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| pool_mode | transaction | Best for stateless web apps |
| default_pool_size | 25 | Per Supabase tier limit |
| max_client_conn | 200 | Connection queue limit |
| reserve_pool_size | 5 | Burst handling |
| reserve_pool_timeout | 5s | Reserve pool activation delay |
| server_idle_timeout | 600s | Connection reuse window |

**Scaling Plan**:
- 0–50K users: Default Supabase pool (15 connections)
- 50K–500K users: PgBouncer with pool_size 50, dedicated connection pooler instance
- 500K–1M+ users: Multiple pooler instances with read/write splitting

### Read Replicas

**Strategy**:
- Supabase supports up to 5 read replicas
- Replicas handle: product catalog queries, analytics, reporting
- Primary handles: writes, user auth, order processing

**Traffic Routing**:

| Query Type | Target | Rationale |
|------------|--------|-----------|
| User login/auth | Primary | Strong consistency required |
| Order creation | Primary | Write operation |
| Product search | Read replica | Eventually consistent acceptable |
| Category browsing | Read replica | Read-heavy, stale data acceptable |
| Dashboard analytics | Read replica | Batch queries, no real-time requirement |
| Wallet balance | Primary | Consistent read required |

**Replica Scaling Plan**:
- 0–50K users: No replicas
- 50K–200K users: 1 read replica
- 200K–500K users: 2 read replicas
- 500K–1M+ users: 3–5 read replicas, regional distribution

### Partitioning Strategy

**Partitioned Tables**:

| Table | Partition Key | Partition Type | Interval | Rationale |
|-------|---------------|----------------|----------|-----------|
| messages | created_at | Range | Monthly | Chat history grows rapidly |
| orders | created_at | Range | Monthly | Order lookup by date range |
| analytics_events | event_timestamp | Range | Daily | High-volume event ingestion |
| notification_logs | created_at | Range | Weekly | Notification history |

**Partitioning Implementation**:

```sql
-- Example: orders table partitioning
CREATE TABLE orders (
  id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2025_01
  PARTITION OF orders
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE orders_2025_02
  PARTITION OF orders
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

**Automation**: Partition management script runs monthly via pg_cron to create next month's partitions and detach old ones.

### Caching (Redis)

**Use Cases**:

| Data | Cache Strategy | TTL | Rationale |
|------|---------------|-----|-----------|
| Product catalog | Cache-aside | 5 min | Frequently read, rarely updated |
| User sessions | Write-through | 24 hours | Session persistence |
| Category tree | Cache-aside | 1 hour | Slow-changing data |
| Search results | Cache-aside | 2 min | High read volume |
| Rate limit counters | Write-through | Variable | Sub-second latency required |
| Feature flags | Write-through | 5 min | Fast toggle propagation |

**Redis Scaling**:
- Upcloud Redis with maxmemory 1GB–4GB
- LFU eviction policy for hot data retention
- Cluster mode with 3 shards beyond 500K users
- Read replicas for cache-aside patterns

## Application Scaling

### Horizontal Scaling

**Architecture**:
- Stateless Next.js API routes deployed on Vercel serverless
- Edge functions for geographic-specific logic (M-Pesa, region routing)
- Background job workers on dedicated instances

**Scaling Rules**:

| User Tier | API Instances | Workers | Edge Functions |
|-----------|---------------|---------|----------------|
| 0–50K | Vercel Pro (auto-scale) | 2 | 5 |
| 50K–200K | Vercel Team (auto-scale) | 5 | 10 |
| 200K–500K | Vercel Enterprise (auto-scale) | 10 | 20 |
| 500K–1M+ | Vercel Enterprise + dedicated | 20 | 30+ |

### Stateless Design

- No server-side session storage (JWTs for auth)
- File uploads streamed directly to Cloudinary (not through app server)
- Background jobs dispatched via queue, not in-process
- Configuration loaded from Redis at startup, not file system
- Request-scoped database connections (no connection stickiness)

### CDN Caching

**Cloudflare Cache Rules**:

| Path Pattern | Cache TTL | Edge TTL | Bypass Cookie |
|-------------|-----------|----------|---------------|
| `/products/*` | 1 hour | 24 hours | — |
| `/category/*` | 1 hour | 24 hours | — |
| `/api/products` | 5 min | 30 min | — |
| `/api/search` | 2 min | 10 min | — |
| `/static/*` | 1 year | 1 year | — |
| `/api/orders/*` | No cache | No cache | — |
| `/api/user/*` | No cache | No cache | — |
| `/api/cart/*` | No cache | No cache | — |
| Image assets | 30 days | 30 days | — |

**Cache Invalidation**:
- Product update → Purge `/products/*` and `/api/products`
- Category change → Purge `/category/*`
- Deployment → Purge all HTML pages via Vercel webhook

### Edge Functions

**Deployment**:
- Cloudflare Workers for global edge logic
- Supabase Edge Functions for database-proxied operations

**Edge Function Use Cases**:

| Function | Runtime | Trigger | Purpose |
|----------|---------|---------|---------|
| M-Pesa callback handler | Cloudflare Worker | HTTP | Handle payment callbacks with low latency |
| Image optimization | Cloudflare Worker | `fetch` event | Resize/format images at edge |
| Rate limiting | Cloudflare Worker | `request` event | Distributed rate limiting |
| Geo-routing | Cloudflare Worker | `request` event | Route to nearest region |
| Auth token validation | Supabase Edge | `request` event | Validate JWTs before DB access |

## Frontend Scaling

### CDN (Cloudflare)

- All static assets served via Cloudflare CDN
- HTML pages cached at edge with 5-minute TTL
- Image optimization via Cloudflare Image Resizing
- Brotli compression enabled for all text responses
- HTTP/2 and HTTP/3 enabled

### ISR/SSG for Static Pages

| Page Type | Strategy | Revalidate | Rationale |
|-----------|----------|------------|-----------|
| Homepage | ISR | 60 seconds | Fresh content, fast load |
| Product detail | ISR | 300 seconds | Price/stock updates |
| Category listing | ISR | 300 seconds | New products |
| Seller profile | ISR | 600 seconds | Less frequent updates |
| Blog/help pages | SSG | On build | Static content |
| Search results | SSR | — | Dynamic per user |
| User dashboard | SSR | — | User-specific data |
| Admin panel | SSR | — | Real-time data |

### Image Optimization

| Image Type | Max Width | Format | Quality | Loading |
|------------|-----------|--------|---------|---------|
| Product listing | 400px | WebP | 80 | Lazy |
| Product detail | 800px | WebP | 85 | Eager (above fold) |
| Banner/hero | 1920px | WebP | 75 | Eager |
| Seller logo | 200px | WebP | 90 | Lazy |
| Category icon | 64px | WebP | 90 | Lazy |

### Bundle Splitting

**Strategy**:
- Route-based code splitting (Next.js automatic)
- Vendor chunk separation (react, react-dom, etc.)
- Dynamic imports for heavy components (checkout, dashboard charts)
- Tree shaking for unused Supabase client features
- Monorepo package splitting (shared UI, utilities, types)

**Target Bundle Sizes**:

| Page | Current | Target |
|------|---------|--------|
| Homepage | 150KB JS | <100KB JS |
| Product listing | 200KB JS | <150KB JS |
| Product detail | 180KB JS | <120KB JS |
| Checkout | 250KB JS | <180KB JS |
| Dashboard | 300KB JS | <200KB JS |

## Cache Strategy

### Redis Cache

| Cache Name | Key Pattern | Data Structure | TTL | Size Estimate |
|------------|-------------|---------------|-----|---------------|
| Session | `session:{user_id}` | String (JWT hash) | 24h | 1KB per user |
| Rate Limit | `ratelimit:{ip}:{endpoint}` | Sorted Set | 1-60s | 100B per key |
| Product | `product:{id}` | Hash | 5min | 2KB per product |
| Category | `category:{slug}` | String (JSON) | 1h | 50KB per category |
| Search | `search:{query}:{page}` | String (JSON) | 2min | 10KB per query |
| Config | `config:{key}` | String | 5min | 1KB per config |
| Queue | `queue:{name}` | List | — | Variable |

### Supabase Cache

- Analytics materialized views refreshed hourly
- Product search via PostgreSQL full-text search with cached results
- Dashboard aggregates computed via nightly cron, cached in summary tables

### In-Memory Cache

- Application configuration loaded at server start
- Feature flags cached with 1-second refresh interval
- Static reference data (counties, categories, payment methods)

## Queue Scaling

### Job Workers

**Queue System**: BullMQ with Upstash Redis

| Queue | Concurrency | Priority | Jobs/Day (at 1M users) |
|-------|-------------|----------|------------------------|
| Payment processing | 10 | High | 50,000 |
| Email/SMS notifications | 20 | Medium | 200,000 |
| Image processing | 5 | Low | 30,000 |
| Analytics ingestion | 15 | Low | 1,000,000+ |
| Order fulfillment | 10 | High | 50,000 |
| Data export | 2 | Low | 500 |

**Horizontal Scaling**:
- Workers scale based on queue depth (HPA in Kubernetes/Vercel)
- Each worker processes one job at a time per CPU core
- Worker count scales from 2 (baseline) to 50 (peak)

### Dead Letter Queues

- Jobs failing >3 times moved to DLQ
- DLQ monitored hourly by on-call engineer
- DLQ jobs automatically retried after bug fix deployment
- Alert if DLQ depth exceeds 100

### Priority Queues

| Queue | Priority | Processing Guarantee |
|-------|----------|---------------------|
| Payments | Highest | Within 5 seconds |
| SMS/Email | High | Within 30 seconds |
| Order fulfillment | High | Within 1 minute |
| Image processing | Medium | Within 5 minutes |
| Analytics | Low | Within 1 hour |
| Data exports | Low | Within 24 hours |

## Database Sharding Strategy

### Multi-Tenant Sharding

**Shard Key**: `seller_id` (hash-based)

| Shard | Seller ID Range | Server | Region |
|-------|----------------|--------|--------|
| Shard 0 | hash(seller_id) 0–20% | Primary | eu-west-1 |
| Shard 1 | hash(seller_id) 20–40% | Read-replica | eu-west-1 |
| Shard 2 | hash(seller_id) 40–60% | Primary | eu-west-2 |
| Shard 3 | hash(seller_id) 60–80% | Primary | eu-west-1 |
| Shard 4 | hash(seller_id) 80–100% | Primary | eu-west-2 |

**When to Shard**: When single database exceeds 500GB or 100K sellers.

**Sharding Implementation**:
- Application-level shard routing via middleware
- Shard map stored in Redis for fast lookup
- Cross-shard queries minimized (aggregates via materialized views)
- Shard rebalancing tool for uneven distribution

### Data Locality

- Seller's orders, products, and messages stored on same shard
- Buyer data replicated across all shards (read-only copies)
- Cross-shard transactions avoided; use saga pattern instead
- Buyer queries across sellers use scatter-gather pattern with parallel shard queries
