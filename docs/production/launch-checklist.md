# Launch Checklist

## Pre-Launch (T-7 Days)

### Security
- [ ] External security audit completed and findings resolved
- [ ] Penetration test conducted on all critical flows (auth, checkout, payment)
- [ ] Dependency vulnerability scan passed (`pnpm audit`)
- [ ] All API keys and secrets rotated for production
- [ ] Supabase RLS policies reviewed and tested with production-like data
- [ ] CSP and security headers validated with observatory.mozilla.org
- [ ] Rate limiting thresholds confirmed for all endpoints

### Load Testing
- [ ] Load test executed with expected peak traffic (K6/Artillery)
- [ ] Concurrent user simulation: baseline, stress, spike tests completed
- [ ] Database connection pooling limits validated under load
- [ ] API response times under load verified (p95 < 1s)
- [ ] CDN cache hit ratio projected for static assets
- [ ] Error rates under load confirmed < 0.5%

### Infrastructure
- [ ] DNS propagation initiated (update TTL to 300 before cutover)
- [ ] SSL/TLS certificates valid and auto-renewal configured (Cloudflare)
- [ ] Custom domain configured in Cloudflare Pages
- [ ] WAF rules reviewed and enabled
- [ ] DDoS protection confirmed active
- [ ] Staging environment destroyed or scaled down to save costs

## Pre-Launch (T-3 Days)

### Database
- [ ] Full database backup created and stored in secure location
- [ ] Backup restoration tested from backup to a new database instance
- [ ] Migration rollback plan documented and tested
- [ ] Point-in-time recovery verified
- [ ] Database connection pooler (Supabase pooler) settings finalized
- [ ] Query performance baselines recorded

### Rollback Plan
- [ ] Rollback procedure documented (see `deployment-guide.md`)
- [ ] Previous working build artifact tagged and accessible
- [ ] Database rollback migration scripts prepared
- [ ] Rollback time estimated and acceptable under SLA
- [ ] Rollback drill executed in staging

### Monitoring
- [ ] Monitoring dashboards reviewed:
  - [ ] Cloudflare analytics dashboard
  - [ ] Supabase database health dashboard
  - [ ] Error tracking dashboard (Sentry or custom)
  - [ ] Performance monitoring dashboard (Web Vitals)
  - [ ] Uptime monitoring dashboard
- [ ] Alerting rules tested (trigger a test alert, verify notification)
- [ ] On-call rotation confirmed and contact information verified
- [ ] Incident response runbook printed and accessible offline

## Pre-Launch (T-1 Day)

### Build
- [ ] Latest build from `main` branch passes (`pnpm build`)
- [ ] TypeScript compilation zero errors (`tsc --noEmit`)
- [ ] All tests pass (`pnpm test` and `pnpm test:ui`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Production build deployed to preview environment for final sign-off
- [ ] Lighthouse scores confirmed (Performance ≥ 90, Accessibility ≥ 90, SEO ≥ 95)

### Environment
- [ ] Environment variables validated against production values
- [ ] No placeholder or development values remain in `.env.local`
- [ ] Feature flags reviewed:
  - [ ] `ENABLE_BETA_FEATURES=false`
  - [ ] `ENABLE_MAINTENANCE_MODE=false`
  - [ ] `ENABLE_ANALYTICS=true`
  - [ ] `ENABLE_RATE_LIMITING=true`
- [ ] All external service API keys valid and not near expiry
- [ ] Supabase project set to production tier (not free tier)

### Communication
- [ ] Launch announcement drafted (email, social media, blog)
- [ ] Customer support team briefed on launch timeline
- [ ] Support channel (email/chat) confirmed operational
- [ ] Known issues documented and shared with support team
- [ ] Stakeholder notification sent with launch timeline

## Launch Day

### Deploy
- [ ] Final `main` branch commit tagged with release version (`v1.0.0`)
- [ ] Production build triggered via CI/CD (Cloudflare Pages/GitHub Actions)
- [ ] Deployment progress monitored in Cloudflare Pages dashboard
- [ ] Edge function deployment confirmed successful

### Verification
- [ ] Health endpoint `GET /api/health` returns 200
- [ ] Database connectivity confirmed via health check
- [ ] Authentication flow verified:
  - [ ] User sign-up works
  - [ ] User sign-in works
  - [ ] Password reset flow works
  - [ ] MFA enrollment and verification works
- [ ] Core user journeys smoke-tested:
  - [ ] Browse products → view product → add to cart → checkout
  - [ ] Seller registration → create product → manage listings
  - [ ] Search → filter results → view product
  - [ ] User profile → edit settings → view orders
- [ ] Payment/checkout flow tested with test card
- [ ] Email notifications received (welcome email, order confirmation)
- [ ] Admin dashboard accessible and data loading correctly

### Monitoring (First Hour)
- [ ] Error rates observed — confirm < 0.5%
- [ ] API response times monitored — confirm p95 < 500ms
- [ ] Concurrent user count tracked
- [ ] CDN cache hit ratio verified
- [ ] Database CPU/memory usage within acceptable range
- [ ] Cloudflare edge response statuses reviewed (no spike in 5xx/4xx)
- [ ] Web Vitals collected and reviewed in real-time
- [ ] Console errors checked (browser dev tools, server logs)

### Performance (First Hour)
- [ ] LCP, FID, CLS verified against targets
- [ ] Server response time (TTFB) monitored
- [ ] Image loading confirmed optimized
- [ ] Third-party script impact assessed
- [ ] Bundle sizes reviewed in production (no unexpected bloat)

## Post-Launch (T+24 Hours)

### Scale Monitoring
- [ ] Autoscaling behavior observed (if applicable)
- [ ] Database connection pool usage trend reviewed
- [ ] API rate limit headroom assessed
- [ ] CDN bandwidth and request volume reviewed
- [ ] Supabase row count growth tracked
- [ ] Storage usage reviewed (Cloudinary, Supabase Storage)

### User Feedback
- [ ] User feedback collected via in-app survey/support channel
- [ ] Error reports reviewed and triaged
- [ ] Feature request backlog updated
- [ ] Social media mentions monitored
- [ ] App store reviews checked (if applicable)

### Incident Response
- [ ] On-call incident response team on standby
- [ ] PagerDuty/OpsGenie escalation paths confirmed
- [ ] Rollback triggers defined (e.g., error rate > 5%, 5xx > 2%)
- [ ] Communication template ready for status updates
- [ ] Post-mortem process documented for any incidents

### Wrap-Up
- [ ] DNS TTL restored to normal values (86400)
- [ ] Staging environment spun down or reconfigured
- [ ] Launch retrospective scheduled with team
- [ ] Performance baselines saved for future comparison
- [ ] Monitoring alert thresholds refined based on production data
