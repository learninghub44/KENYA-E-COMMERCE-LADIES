# Troubleshooting Guide

## Build Failures

### Dependency Issues

**Error**: `Module not found: Can't resolve 'X'` or `ERR_PNPM_NO_MATCHING_VERSION`

**Checks**:
- Is the dependency listed in `package.json`?
- Is the version in `package.json` compatible with other dependencies?
- Run `pnpm install` to update lockfile
- Check `pnpm-lock.yaml` for resolution issues

**Resolution**:
```bash
pnpm install                  # Reinstall dependencies
pnpm update X                 # Update specific package
pnpm deduplicate              # Dedupe dependency tree
rm -rf node_modules && pnpm install  # Fresh install
```

### TypeScript Errors

**Error**: `Type 'X' is not assignable to type 'Y'` or `Property 'X' does not exist on type 'Y'`

**Checks**:
- Type definitions match the data shape from Supabase/API
- Generated types are up to date (`npx supabase gen types typescript`)
- Generic parameters match expected constraints

**Resolution**:
```bash
npx supabase gen types typescript --linked > lib/supabase/database.types.ts
npx tsc --noEmit              # Run type checker
```
- Update type definitions to match schema changes
- Fix explicit `any` usages with proper types

### Module Not Found

**Error**: `Cannot find module 'X' or its corresponding type declarations`

**Resolution**:
- Verify the module is installed: `pnpm ls X`
- Check import path is correct (case-sensitive on Linux/Vercel)
- Verify `tsconfig.json` paths and `baseUrl` are configured
- For local modules, ensure they are exported from `index.ts`

### ESLint Errors

**Error**: `X is defined but never used` or `X is missing in props validation`

**Resolution**:
```bash
pnpm run lint                # View all errors
pnpm run lint --fix          # Auto-fix where possible
```
- Remove unused imports and variables
- Add missing props to TypeScript interface or PropTypes
- Configure `.eslintrc` rules if false positive

## Deployment Issues

### Failed Deploy

**Error**: Vercel/GitHub Actions deploy fails with non-zero exit code

**Checks**:
- Review build logs in CI output
- Check for recent dependency changes
- Verify environment variables are set in deployment platform

**Resolution**:
- Fix build errors locally first
- Push fix to branch and retry deploy
- If urgency, rollback to previous successful deploy
- Verify `vercel.json` or `next.config.js` for misconfiguration

### Environment Variables Missing

**Error**: `NEXT_PUBLIC_X is not defined` or runtime errors for missing config

**Resolution**:
- Check Vercel project settings → Environment Variables
- Ensure `NEXT_PUBLIC_` prefix for client-accessible variables
- Run `vercel env pull` to sync local `.env` file
- Verify server-only variables are not referenced in client code

### Database Migration Errors

**Error**: `migration X failed` or `relation already exists`

**Checks**:
- Check previous migrations for conflicts
- Verify migration file naming and ordering
- Check for manual changes to database schema

**Resolution**:
```bash
npx supabase migration list                # View all migrations
npx supabase db diff --linked              # Compare with remote
npx supabase migration repair --status reverted <version>  # Repair state
```
- Renumber migration files if ordering is wrong
- Create a new migration to fix schema, do not edit applied migrations

## Authentication Issues

### Login Failures

**Symptom**: User cannot log in, "Invalid login credentials"

**Checks**:
- Is the email verified? Check `supabase.auth.users.email_confirmed_at`
- Is the account locked? Check `failed_login_attempts` in user metadata
- Is the password correct? Supabase hashes — no plaintext comparison

**Resolution**:
- Suggest user reset password via "Forgot Password" flow
- Admin can manually confirm email in Supabase dashboard
- Unlock account by resetting `failed_login_attempts` in user metadata

### Session Expired

**Symptom**: User gets logged out frequently or "Session not found"

**Checks**:
- Check `AUTH_TOKEN_REFRESH_INTERVAL` setting
- Verify client-side session refresh logic
- Check for stale tokens in localStorage

**Resolution**:
- User re-logs in (auto-refresh should handle for active users)
- Clear cookies and localStorage, then re-authenticate
- Check Supabase Auth settings → Session timeouts

### OAuth Callback Errors

**Symptom**: "Redirect URI mismatch" or "State mismatch"

**Checks**:
- Verify OAuth provider redirect URIs match Supabase settings
- Check `site_url` in Supabase Auth settings
- Ensure state parameter is validated on callback

**Resolution**:
- Update redirect URIs in Google/Facebook/GitHub OAuth console
- Update `site_url` and `redirect_urls` in Supabase Auth config
- For state mismatch, disable CSRF protection temporarily for testing only

### RLS Policy Violations

**Symptom**: "new row violates row-level security policy" or 401 on data access

**Checks**:
- Is the user authenticated? Check JWT payload
- Does the user have the correct role for the operation?
- Does the RLS policy exist for the table/operation?

**Resolution**:
- Use `npx supabase db dump --linked --data-only` to verify current RLS policies
- Test policies with `SELECT * FROM pg_policies WHERE tablename = 'X'`
- Enable `auth.uid()` and role checks in policies
- Use `security definer` only when absolutely necessary

## Performance Issues

### Slow Page Loads

**Symptom**: Page load time > 3 seconds

**Checks**:
- Network tab → Largest Contentful Paint (LCP) element
- Server response time (TTFB)
- Bundle size in DevTools → Coverage tab

**Resolution**:
- Enable ISR / SSR caching for static pages
- Lazy load below-fold images and components
- Optimize images with next/image (WebP, responsive sizes)
- Reduce bundle size with code splitting (`dynamic(() => import(...))`)
- Check for render-blocking resources

### High API Latency

**Symptom**: API endpoints responding slowly (>500ms p95)

**Checks**:
- Database query performance (`EXPLAIN ANALYZE`)
- N+1 query patterns in Prisma / Supabase queries
- Missing indexes on filtered/joined columns

**Resolution**:
- Add database indexes on `WHERE`, `ORDER BY`, and `JOIN` columns
- Implement server-side caching with Redis
- Batch queries with `Promise.all` or database joins
- Paginate large result sets

### Memory Leaks

**Symptom**: Increasing memory usage over time, crashes after extended use

**Checks**:
- Heap snapshots in Chrome DevTools → Memory tab
- `window.performance.memory` metrics
- Event listeners accumulating in Components

**Resolution**:
- Clean up `useEffect` subscriptions and event listeners
- Cancel ongoing fetch requests on component unmount
- Avoid storing large objects in global state or closures
- Use `WeakMap` / `WeakSet` for cache references

### Database Query Bottlenecks

**Symptom**: Specific queries timing out or consuming high CPU

**Resolution**:
```sql
-- Identify slow queries
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Add missing index
CREATE INDEX CONCURRENTLY idx_products_category
ON products(category_id);
```

- `EXPLAIN ANALYZE` the problematic query to find full table scans
- Add composite indexes for multi-filter queries
- Consider materialized views for expensive aggregation queries
- Use Supabase query plan analyzer for recommendations

## Database Issues

### Connection Pool Exhaustion

**Symptom**: `too many connections` or `remaining connection slots are reserved`

**Checks**:
- Check Supabase dashboard → Database → Pooler usage
- Look for unclosed connections in application code
- Identify long-running queries blocking connections

**Resolution**:
- Increase pool size in Supabase project settings
- Implement connection pooling middleware (e.g., `pg-pool`)
- Close connections in `finally` blocks or with `useSupabaseClient`
- Kill idle connections: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND age(now, query_start) > interval '5 minutes'`

### Deadlocks

**Symptom**: `deadlock detected` or transactions stuck indefinitely

**Resolution**:
- Ensure consistent lock ordering across all transactions
- Shorten transaction durations
- Use `SELECT ... FOR UPDATE NOWAIT` or `SKIP LOCKED` where appropriate
- Retry failed transactions with exponential backoff

### Slow Queries

**Symptom**: Queries taking seconds instead of milliseconds

**Resolution**:
- Run `EXPLAIN (ANALYZE, BUFFERS)` to identify full table scans
- Check for missing indexes (especially on foreign keys)
- Avoid `SELECT *` — fetch only needed columns
- Partition large tables by date or category
- Use `LIMIT` and pagination for large result sets

### Migration Conflicts

**Symptom**: Migration fails because schema has diverged

**Checks**:
- `npx supabase migration list` to compare local vs remote
- Check for manual SQL changes in Supabase dashboard

**Resolution**:
```bash
npx supabase migration repair --status reverted <broken-migration>
npx supabase db push
```
- Create a new migration to reconcile differences
- Never edit applied migrations — always create a new one

## PWA Issues

### Service Worker Not Registering

**Symptom**: App does not work offline, no service worker in DevTools → Application

**Checks**:
- Is `next-pwa` or `@serwist/next` configured in `next.config.js`?
- Check DevTools → Application → Service Workers for registration status
- Look for registration errors in Console

**Resolution**:
- Ensure service worker file is accessible at `/sw.js`
- Verify `public/sw.js` or generated SW is present in build output
- Check HTTPS (service workers require HTTPS or localhost)
- Clear browser cache and re-register

### Offline Page Not Working

**Symptom**: Offline page shows generic browser error instead of custom page

**Checks**:
- Verify offline page is cached in service worker `install` event
- Check `Cache Storage` in DevTools → Application
- Test with Network tab set to Offline

**Resolution**:
- Update service worker cache strategy to `NetworkFirst` or `CacheFirst`
- Pre-cache offline page during service worker install
- Add fallback route handler for navigation requests

### Cache Invalidation

**Symptom**: Users see stale content after deploy

**Checks**:
- Service worker version number in `next.config.js`
- Cache names in service worker file

**Resolution**:
- Bump service worker version/cache name on each deploy
- Implement `activate` event to delete old caches
- Add versioned cache names (e.g., `static-v2`, `dynamic-v2`)
- Notify users to refresh the page for updates

## Security Issues

### Rate Limiting Triggered

**Symptom**: 429 Too Many Requests, user blocked temporarily

**Checks**:
- Is the user exceeding normal request patterns?
- Check rate limit counters in Redis or middleware logs
- Look for bots or automated scripts targeting the endpoint

**Resolution**:
- Wait for rate limit window to expire (typically 1-15 minutes)
- If legitimate user, whitelist IP in rate limiter config
- If bot, add IP to blocklist and update WAF rules
- Review and adjust rate limit thresholds if false positive

### CSRF Token Mismatch

**Symptom**: 403 Forbidden on form submissions, "CSRF token missing" in logs

**Checks**:
- Is the CSRF token included in the request body/header?
- Is the token valid for the current session?
- Check cookie settings (SameSite, Secure, HttpOnly)

**Resolution**:
- Ensure `csrfToken()` is included in all forms as hidden input
- Verify token is fetched and refreshed on page load
- Check `SameSite` cookie attribute (use `Lax` or `Strict`)
- For API routes using fetch, include `X-CSRF-Token` header

### CSP Violations

**Symptom**: Console warnings for Content Security Policy, resources blocked

**Checks**:
- Check Console for CSP violation report
- Identify blocked resource and its source domain
- Review `next.config.js` CSP headers

**Resolution**:
- Add allowed domains to `img-src`, `script-src`, `style-src` directives
- Use strict CSP with nonces instead of allowlists
- Monitor violations via reporting endpoint (`report-uri` / `report-to`)
- Never add `'unsafe-inline'` — use nonces or hashes

### Suspicious Activity

**Symptom**: Unusual login patterns, high failed auth rate, data scraping

**Checks**:
- Review auth logs for geographic anomalies
- Check IP reputation with threat intelligence feeds
- Analyze request patterns for scraping behavior

**Resolution**:
- Block offending IPs via Cloudflare WAF
- Enable CAPTCHA for login and registration
- Implement progressive delays on repeated requests
- Notify security team and consider incident declaration
- Rotate exposed credentials if data breach suspected
