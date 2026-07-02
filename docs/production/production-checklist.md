# Production Readiness Checklist

## Database

- [ ] All Supabase migrations applied (`supabase db push`)
- [ ] No pending migrations in `supabase/migrations/`
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] All RLS policies verified and tested with `supabase db test`
- [ ] Database indexes created for frequent query patterns:
  - `products` — (category_id, created_at), (seller_id), (slug)
  - `orders` — (user_id, created_at), (status)
  - `reviews` — (product_id, created_at)
  - `messages` — (conversation_id, sent_at)
  - `notifications` — (user_id, read, created_at)
- [ ] Foreign key constraints enforced on all relationships
- [ ] Database backups configured (daily + hourly WAL archiving)
- [ ] Backup restoration tested in staging environment
- [ ] Point-in-time recovery configured
- [ ] Connection pool limits set (Supabase pooler configured)
- [ ] Table row count estimates acceptable (< 10M per table or partitioning planned)
- [ ] Vacuuming/autovacuum settings reviewed for high-write tables

## Authentication

- [ ] Supabase Auth project configured (production settings)
- [ ] Email/password sign-up enabled and tested
- [ ] OAuth providers configured (Google, Facebook if required)
- [ ] Password policy enforced (minimum 8 chars, complexity requirements)
- [ ] Multi-factor authentication (MFA) enabled for admin/seller accounts
- [ ] MFA enrollment flow tested end-to-end
- [ ] Session handling configured (JWT expiry, refresh token rotation)
- [ ] `@supabase/ssr` cookie settings configured for production
- [ ] Auth callback URLs whitelisted (`NEXT_PUBLIC_APP_URL`)
- [ ] Rate limiting on auth endpoints (login, signup, password reset)
- [ ] Email verification flow working in production
- [ ] Password reset flow working end-to-end
- [ ] Account lockout after failed attempts configured
- [ ] Supabase Auth webhooks connected for user lifecycle events

## API

- [ ] All route handlers connected to real services (no stubs/mocks)
- [ ] API routes implemented under `app/api/` with proper error handling
- [ ] CORS configured for production origin only
- [ ] Rate limiting active on all public API endpoints
- [ ] Request validation via Zod schemas on all inputs
- [ ] Proper HTTP status codes returned (200, 201, 400, 401, 403, 404, 409, 500)
- [ ] Consistent API response envelope (`{ data, error }`)
- [ ] Pagination implemented for list endpoints (cursor or offset-based)
- [ ] Idempotency keys on mutation endpoints (orders, payments)
- [ ] Timeouts configured on external service calls (Supabase, Cloudinary, Resend)
- [ ] API route handlers wrapped in error boundary
- [ ] Middleware checks (auth, CSRF, rate limit) verified

## Frontend

- [ ] Build succeeds (`pnpm build`) with zero errors
- [ ] TypeScript errors resolved — `tsc --noEmit` passes
- [ ] No `any` types in production code (strict mode enforced)
- [ ] Bundle optimized:
  - [ ] JavaScript chunks analyzed (use `@next/bundle-analyzer`)
  - [ ] Third-party libraries tree-shaken
  - [ ] Dynamic imports for heavy components
  - [ ] `next/dynamic` used for below-fold components
- [ ] Images optimized (WebP/AVIF, responsive `srcSet`, lazy loading)
- [ ] Fonts optimized (next/font, subset loading)
- [ ] Critical CSS inlined
- [ ] No render-blocking resources
- [ ] Client-side data fetching uses TanStack Query with proper caching
- [ ] Error boundaries implemented per route segment
- [ ] Loading states (skeleton screens) for all data-dependent views
- [ ] Empty states for list views with no data
- [ ] Toast/sonner notifications configured for user feedback

## PWA

- [ ] Service worker registered and active (`next-pwa` or custom)
- [ ] Web app manifest valid (name, icons, start_url, display, theme_color)
- [ ] manifest.json served with correct MIME type
- [ ] Offline page working with cached content
- [ ] Install prompt tested (beforeinstallprompt event)
- [ ] App installs successfully on Android Chrome
- [ ] App installs successfully on iOS Safari (via share sheet)
- [ ] Cache strategies defined (CacheFirst, NetworkFirst, StaleWhileRevalidate)
- [ ] Background sync for offline mutations (if applicable)
- [ ] Push notifications configured and tested
- [ ] Lighthouse PWA audit passes

## Security

- [ ] Content Security Policy (CSP) header configured
- [ ] strict-dynamic CSP directive for script loading
- [ ] Security headers set:
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-XSS-Protection: 1; mode=block`
  - [ ] `Referrer-Policy: strict-origin-when-cross-origin`
  - [ ] `Permissions-Policy` (camera=(), microphone=(), geolocation=())
  - [ ] `Strict-Transport-Security` (HSTS)
- [ ] XSS prevention active (React escaping, CSP, input sanitization)
- [ ] CSRF protection enabled on all state-changing requests
- [ ] SQL injection prevention (parameterized queries via Supabase)
- [ ] API keys and secrets never exposed client-side
- [ ] Environment variables validated at build time
- [ ] Dependency audit passed (`pnpm audit`)
- [ ] No hardcoded secrets in source code
- [ ] Cookie security: `HttpOnly`, `Secure`, `SameSite=Lax/Strict`
- [ ] Rate limiting on all sensitive endpoints
- [ ] Supabase RLS policies prevent unauthorized data access
- [ ] File upload validation (type, size, malware scanning)
- [ ] Cloudinary upload preset restricted (no unsigned uploads in production)

## Performance

- [ ] Core Web Vitals meet targets:
  - [ ] Largest Contentful Paint (LCP) < 2.5s
  - [ ] First Input Delay (FID) < 100ms
  - [ ] Cumulative Layout Shift (CLS) < 0.1
  - [ ] Interaction to Next Paint (INP) < 200ms
- [ ] Image lazy loading active on all below-fold images
- [ ] Code splitting working via route segments and dynamic imports
- [ ] Three.js / heavy animation bundles loaded on demand
- [ ] API response times monitored (p95 < 500ms)
- [ ] Database query performance (p95 < 200ms)
- [ ] Redis/memory caching for frequently accessed data
- [ ] CDN caching configured for static assets (Cloudflare)
- [ ] Preload critical resources (fonts, hero images)
- [ ] Bundle size budgets configured in next.config
- [ ] Server-Side Rendering (SSR) vs Static Generation (SSG) optimised per route

## SEO

- [ ] Metadata present on all pages (title, description, og:image)
- [ ] Dynamic metadata via `generateMetadata` for product/category pages
- [ ] Sitemap generated and submitted (Google Search Console)
- [ ] sitemap.xml accessible at `/sitemap.xml`
- [ ] robots.txt configured (allow all, sitemap URL included)
- [ ] robots.txt accessible at `/robots.txt`
- [ ] JSON-LD structured data present:
  - [ ] `Organization` schema for homepage
  - [ ] `Product` schema for product pages
  - [ ] `BreadcrumbList` schema for navigation
  - [ ] `WebSite` schema with search action
- [ ] Canonical URLs set on all pages
- [ ] `hreflang` tags configured (if multi-language)
- [ ] Mobile-friendly test passes
- [ ] Google Analytics / tag manager configured
- [ ] Search appearance preview checked

## Accessibility

- [ ] WCAG 2.2 AA compliance verified
- [ ] Keyboard navigation works (Tab, Enter, Escape, arrow keys)
- [ ] Focus indicators visible (not removed via `outline: none`)
- [ ] Skip-to-content link present
- [ ] All images have meaningful `alt` text
- [ ] Form inputs associated with labels (`htmlFor`)
- [ ] ARIA landmarks used (`<nav>`, `<main>`, `<aside>`, role attributes)
- [ ] Color contrast ratios meet AA minimum (4.5:1 normal, 3:1 large)
- [ ] Screen reader tested (VoiceOver, NVDA, JAWS)
- [ ] Focus trap in modals and dialogs
- [ ] Live regions for dynamic content updates (`aria-live`)
- [ ] Error messages announced by screen readers
- [ ] Touch targets minimum 44x44px
- [ ] Reduced motion media query respected (`prefers-reduced-motion`)
- [ ] Heading hierarchy logical (h1 > h2 > h3, no skipping)
- [ ] Link text descriptive (not "click here")

## Monitoring

- [ ] Error tracking configured:
  - [ ] Client-side error capture (window.onerror, React error boundaries)
  - [ ] Server-side error capture (API routes, server actions)
  - [ ] Unhandled promise rejections tracked
- [ ] Logging configured:
  - [ ] Structured JSON logging for API routes
  - [ ] Log levels (debug, info, warn, error) configured
  - [ ] Log retention policy defined
- [ ] Performance monitoring:
  - [ ] Web Vitals reported to analytics
  - [ ] Custom performance metrics tracked
  - [ ] API latency tracked per endpoint
- [ ] Uptime monitoring configured (Pingdom, Checkly, or similar)
- [ ] Alert thresholds defined:
  - [ ] Error rate > 1% triggers alert
  - [ ] API p95 latency > 1s triggers alert
  - [ ] 5xx rate > 0.5% triggers alert
- [ ] Incident response runbook created
- [ ] Database query monitoring active (pg_stat_statements or Supabase logs)
- [ ] Cloudflare analytics reviewed for edge response statuses
