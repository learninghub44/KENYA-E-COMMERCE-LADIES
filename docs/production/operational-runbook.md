# Operational Runbook

## Daily Tasks

| Time | Task | Owner | Check |
|------|------|-------|-------|
| 08:00 EAT | Review Sentry error logs for new issues | On-call | Dashboard URL |
| 08:15 EAT | Check queue depths (email, image processing, notifications) | On-call | Bull Dashboard |
| 08:30 EAT | Verify health endpoints for all services | On-call | `/api/health` |
| 09:00 EAT | Monitor key performance metrics (p95 response time, error rate, throughput) | On-call | Datadog |
| Hourly | Quick check of Supabase connection pool usage | On-call | Supabase Dashboard |
| EOD | Summary of incidents and anomalies in `#ops-daily` | On-call | Slack |

## Weekly Tasks

| Day | Task | Owner |
|-----|------|-------|
| Monday | Review Google Analytics / Plausible dashboards | Product Manager |
| Tuesday | Check Supabase storage usage and billing projection | DevOps |
| Wednesday | Audit failed jobs in queue (retry or discard) | Engineering |
| Thursday | Review security logs and failed authentication attempts | Security Lead |
| Friday | Dependency vulnerability scan review (`npm audit`, `snyk`) | Engineering |

## Monthly Tasks

| Week | Task | Owner |
|------|------|-------|
| Week 1 | Database maintenance: `VACUUM ANALYZE` on all tables | DBA |
| Week 1 | Review backup integrity: restore test on staging | DBA |
| Week 2 | Rotate secrets: API keys, service tokens, admin credentials | Security Lead |
| Week 2 | Review and update dependency versions | Engineering |
| Week 3 | Review RLS policies and permission grants | Security Lead |
| Week 3 | Full penetration test or vulnerability assessment | Security Lead |
| Week 4 | Review incident response runbook and update if needed | Engineering Manager |
| Week 4 | Capacity planning review (database, storage, compute) | DevOps |

## On-Call Procedures

### Alert Response Times

| Alert Type | Response Time | Escalation After |
|------------|---------------|------------------|
| SEV1 (critical) | 15 minutes | 5 minutes |
| SEV2 (major) | 30 minutes | 10 minutes |
| SEV3 (minor) | 2 hours | 30 minutes |
| SEV4 (cosmetic) | Next business day | Next day |

### On-Call Shift
- Rotation: Weekly, Mon 09:00 EAT → Mon 09:00 EAT
- Handoff: Document open incidents and ongoing investigations
- Coverage: Must respond within SLA from any location

### Common Incident Resolutions

| Symptom | Likely Cause | First Action |
|---------|-------------|--------------|
| 502 Bad Gateway | Server overload or crash | Restart service, check logs |
| Database timeout | Connection pool exhaustion | Increase pool size, check slow queries |
| High error rate | Recent deploy regression | Rollback to previous version |
| Payment failures | Provider API down | Switch to fallback provider |
| Slow page loads | CDN or cache miss | Verify CDN config, warm cache |

### Escalation Path
1. On-call engineer acknowledges alert
2. On-call cannot resolve within SLA → escalate to Engineering Manager
3. Engineering Manager cannot resolve → escalate to CTO
4. CTO declares SEV1 incident if criteria met

## Common Operations

### Deploy New Version

```bash
# 1. Verify CI/CD pipeline passes
# 2. Deploy to staging
vercel --prod --scope staging
# 3. Run smoke tests
npm run test:smoke
# 4. Deploy to production
git tag vX.Y.Z
git push origin vX.Y.Z
# 5. Verify health
curl https://api.kenyaecommerce.com/api/health
# 6. Monitor for 15 minutes
```

### Rollback Deployment

```bash
# Option A: Git revert and push
git revert HEAD~1 --no-edit
git push origin main

# Option B: Vercel rollback
vercel rollback --scope production

# After rollback, verify health and notify team
```

### Clear Cache

```bash
# Redis cache flush (specific keys)
redis-cli -h $REDIS_HOST KEYS "session:*" | xargs redis-cli DEL

# CDN cache purge
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"purge_everything":true}'
```

### Restart Service

```bash
# Vercel function restart (re-deploy current)
vercel --prod --force

# Background job worker
pm2 restart worker
```

### Run Database Migration

```bash
# Generate migration
npx supabase migration new description_of_change

# Apply to staging
npx supabase db push --linked

# Apply to production (after review)
npx supabase db push --linked --target production
```

## Maintenance Mode

### Enable Maintenance Mode

1. Set environment variable `MAINTENANCE_MODE=true`
2. Update DNS or load balancer to serve maintenance page
3. Verify maintenance page renders with 503 status code
4. Notify users via social media and email

### What Gets Affected

- All public-facing pages serve maintenance page
- API endpoints return 503 Service Unavailable
- Background jobs continue processing (unless explicitly stopped)
- Admin panel remains accessible (bypassed via IP allowlist)

### Notify Users

```markdown
We will be performing scheduled maintenance on [date] from [start] to [end] EAT.
During this time, the site will be temporarily unavailable.
We apologize for the inconvenience.
```

### Disable Maintenance Mode

1. Set `MAINTENANCE_MODE=false`
2. Restore DNS / load balancer to normal routing
3. Verify all health endpoints return 200
4. Run smoke tests
5. Post `#general` in Slack: "Maintenance complete. All services operational."
