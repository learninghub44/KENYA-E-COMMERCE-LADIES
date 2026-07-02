# Monitoring Guide

## Application Monitoring

### Error Tracking (Sentry)

**Setup**:
- Sentry SDK integrated in Next.js frontend and API routes
- Source maps uploaded at build time for readable stack traces
- Performance tracing enabled with 5% sample rate in production

**Configuration**:

| Setting | Value |
|---------|-------|
| DSN | Set via `SENTRY_DSN` environment variable |
| Environment | `production`, `staging`, `development` |
| Release | Git commit SHA (auto-detected) |
| Sample Rate | 100% errors, 5% transactions |
| Traces Sample Rate | 0.05 |

**Error Grouping Rules**:
- 4xx errors grouped by status code + path pattern
- 5xx errors grouped by exception type + file location
- Network errors grouped by endpoint + error code
- API timeouts grouped by endpoint + timeout duration

**Alerts**:
- Error rate >1% over 5 minutes → PagerDuty
- New error type detected → Slack #errors channel
- Error count >100 in 1 hour → email to engineering lead

### Performance Monitoring (Vercel Analytics / Google Analytics)

**Vercel Analytics**:
- Web Vitals (LCP, FID, CLS, INP) tracked per route
- SSR/ISR timing for each page
- Edge function execution duration
- API route latency (p50, p95, p99)

**Google Analytics 4**:
- User flows and conversion tracking
- E-commerce events (product view, add to cart, purchase)
- Custom dimensions (seller_id, category, region)
- Funnel analysis for checkout process

## Infrastructure Monitoring

### Supabase Dashboard

**Key Metrics to Monitor**:
- Database connections (active, idle, max)
- CPU and memory utilization
- Disk I/O and storage usage
- Query performance (slow queries >500ms)
- Connection pool utilization

**Health Checks**:
- Database connection test every 60 seconds
- Read replica lag monitoring (alert if >5 seconds)
- Storage bucket accessibility check
- Edge function invocation success rate

**Alert Thresholds**:

| Metric | Warning | Critical |
|--------|---------|----------|
| Connections used | >70% | >85% |
| CPU utilization | >60% | >80% |
| Storage used | >75% | >90% |
| Replica lag | >3 seconds | >10 seconds |
| Slow queries (>1s) | >10/min | >50/min |

### Cloudflare Analytics

**Dashboard Sections**:
- Traffic volume (requests, bandwidth, unique visitors)
- Cache hit ratio (target: >70%)
- Security events (WAF blocks, rate limiting, DDoS)
- Edge worker execution summary
- Bot management score distribution

## Custom Metrics

### Marketplace Health Score

Formula: `(Successful Orders / Total Orders) × (Avg Rating / 5) × (Active Sellers / Total Sellers) × (Avg Delivery Time / Target Time)`

Calculated hourly and stored in analytics_events table. Target: >0.85.

### KPI Dashboards

Real-time dashboard updated every 5 minutes:

**Revenue & Growth**
- Gross Merchandise Volume (GMV) — daily, weekly, monthly
- Active buyers and sellers (30-day rolling)
- Average order value (AOV)
- Conversion rate (visitor to buyer)
- Seller acquisition cost

**Operations**
- Order fulfillment rate (on-time delivery)
- Average delivery time by region
- Dispute rate (% of orders disputed)
- Return rate by category
- Seller onboarding completion rate

**Customer Experience**
- Page load time (p50/p95)
- Search success rate
- Checkout abandonment rate
- Customer support response time
- Net Promoter Score (NPS) — weekly survey

**Platform Health**
- API error rate by endpoint
- Database query performance
- Background job queue depth
- CDN cache hit ratio
- Payment success rate (M-Pesa, card)

### Business Intelligence

- Google Analytics 4 dashboards for marketing attribution
- Supabase SQL queries exported to Metabase for ad-hoc analysis
- Weekly email report with key metrics to stakeholders
- Monthly business review with full KPI breakdown

## Alert Thresholds

| Metric | Threshold | Duration | Severity | Action |
|--------|-----------|----------|----------|--------|
| Error rate | >1% | 5 minutes | Critical | PagerDuty page |
| Response time (API) | >2 seconds | 5 minutes | Critical | PagerDuty page |
| Uptime | <99.9% | 10 minutes | Critical | PagerDuty page |
| Queue depth | >1000 | 5 minutes | Warning | Slack alert |
| Payment failure rate | >3% | 5 minutes | Critical | PagerDuty page |
| Checkout abandonment | >70% | 30 minutes | Warning | Slack alert |
| Database connections | >80% | 10 minutes | Warning | Slack alert |
| Disk usage | >90% | 1 hour | Critical | PagerDuty page |
| CDN cache hit ratio | <60% | 1 hour | Warning | Slack alert |
| SSL certificate expiry | <30 days | — | Warning | Email notification |

## Logging

### Structured Log Format

All application logs use JSON format with consistent fields:

```json
{
  "timestamp": "2025-01-15T14:30:00.000Z",
  "level": "info",
  "service": "api",
  "environment": "production",
  "request_id": "req_abc123",
  "message": "Order created successfully",
  "metadata": {
    "order_id": "ord_456",
    "user_id": "usr_789",
    "amount": 2500,
    "payment_method": "mpesa"
  },
  "duration_ms": 245,
  "error": null
}
```

### Log Levels

| Level | Usage | Examples |
|-------|-------|----------|
| debug | Development only, disabled in production | SQL queries, variable dumps |
| info | Normal operation events | Order created, user registered, payment processed |
| warn | Unexpected but non-critical | Rate limit approaching, slow query, retry attempt |
| error | Application errors that require investigation | Failed payment, API timeout, database connection error |
| fatal | System-level failures | Out of memory, database unreachable, uncaught exception |

### Log Retention

| Environment | Retention | Storage |
|-------------|-----------|---------|
| Production | 90 days (hot), 1 year (cold) | Cloudflare Logs + S3 |
| Staging | 30 days | Cloudflare Logs |
| Development | 7 days | Local files |

### Log Aggregation (ELK / Cloudflare)

**Current Setup**: Cloudflare Logs + Logpush to S3

**Log Sources**:
- Vercel serverless function logs via Log Drain
- Supabase database logs via webhook
- Cloudflare edge logs via Logpush
- Application logs via structured JSON to stdout

**Search Use Cases**:
- Find all errors for a specific user_id
- Trace request across API → Database → External service
- Identify slowest API endpoints in last 24 hours
- Correlate error spikes with deployment events

## Uptime Monitoring

### External Monitoring Service

**Better Uptime** (or equivalent):
- 1-minute check intervals for critical endpoints
- 5-minute check intervals for non-critical endpoints
- Checks from 3 global regions (US, EU, Asia)
- SSL certificate monitoring (alert at 30 days before expiry)

**Monitored Endpoints**:

| Endpoint | Check Interval | Expected Status |
|----------|---------------|-----------------|
| `GET /api/health` | 1 min | 200 |
| `GET /api/auth/session` | 1 min | 200 |
| `POST /api/orders/create` | 5 min | 200 |
| `GET /` (homepage) | 5 min | 200 |
| `GET /products` | 5 min | 200 |
| `POST /api/payments/mpesa/stkpush` | 5 min | 200 |
| `GET /api/sellers/{id}/dashboard` | 5 min | 200 |

### Synthetic Checks

Automated browser tests run every 15 minutes via Playwright:

1. Complete user registration flow
2. Product search and browse flow
3. Add item to cart and checkout flow
4. M-Pesa STK push simulation
5. Seller dashboard login and order management
6. Admin panel access and moderation

Failed synthetic checks trigger PagerDuty alert with video recording of failure.

### Status Page

Hosted at `status.kenyaecommerce.co.ke` (Cloudflare Pages):
- Real-time service status (operational/degraded/outage)
- Incident history with timelines
- Scheduled maintenance calendar
- Subscribe to updates via email or RSS
- Component-level status for each microservice

## Dashboard Setup

### Grafana / Cloudflare Dashboards

**Dashboard 1: Executive Overview**
- GMV (daily, weekly, monthly, YOY comparison)
- Active users (DAU, WAU, MAU)
- Order volume and conversion rate
- Platform uptime and error rate
- Revenue breakdown by payment method

**Dashboard 2: Engineering Operations**
- API latency (p50, p95, p99 by endpoint)
- Database query performance
- Error rate by service and error type
- Background job queue depth and processing time
- Deployment events overlay

**Dashboard 3: Business KPIs**
- Seller acquisition and churn rate
- Category performance
- Regional sales distribution
- Customer support metrics
- Average delivery time by courier

**Dashboard 4: Security & Compliance**
- Failed login attempts
- WAF blocked requests
- API key usage anomalies
- Data access audit log volume
- Rate limit exceeded events
