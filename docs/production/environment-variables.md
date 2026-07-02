# Environment Variables Reference

All environment variables are configured in `.env.local` for local development and as Cloudflare Pages environment variables for production and preview deployments.

## Supabase

| Variable | Required | Description | Example Value | Security |
|----------|----------|-------------|---------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL. Used by the client SDK to connect to the database and auth services. | `https://abcdefghijklm.supabase.co` | Public — exposed to browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous API key. Used by the client SDK for public/anonymous access with RLS enforcement. | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Public — exposed to browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key. Bypasses RLS for admin operations, server-side data access, and background jobs. | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | **Secret** — server-side only, never expose to browser |

## Cloudinary

| Variable | Required | Description | Example Value | Security |
|----------|----------|-------------|---------------|----------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name used for constructing image URLs and client-side upload widgets. | `my-company-cloud` | Public — exposed to browser |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key used for server-side image management and transformations. | `123456789012345` | **Secret** — server-side only |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret used for signing uploads and authenticated API requests. | `abc123def456ghi789` | **Secret** — server-side only |

## Resend (Email)

| Variable | Required | Description | Example Value | Security |
|----------|----------|-------------|---------------|----------|
| `RESEND_API_KEY` | Yes | Resend API key for sending transactional emails (welcome, order confirmation, password reset). | `re_abc123def456` | **Secret** — server-side only |

## Groq (AI)

| Variable | Required | Description | Example Value | Security |
|----------|----------|-------------|---------------|----------|
| `GROQ_API_KEY` | Yes | Groq API key for AI-powered features (product recommendations, search, chat). | `gsk_abc123def456` | **Secret** — server-side only |

## Google Analytics

| Variable | Required | Description | Example Value | Security |
|----------|----------|-------------|---------------|----------|
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | No | Google Analytics 4 measurement ID for tracking page views and user interactions. | `G-XXXXXXXXXX` | Public — exposed to browser |

*Note: Also configurable as `NEXT_PUBLIC_GA_MEASUREMENT_ID` (alias).*

## Application

| Variable | Required | Description | Example Value | Security |
|----------|----------|-------------|---------------|----------|
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical production URL of the application. Used for OG meta tags, redirects, and auth callbacks. | `https://www.kisii-ecommerce-ke.com` | Public — exposed to browser |

## Security Secrets

| Variable | Required | Description | Example Value | Security |
|----------|----------|-------------|---------------|----------|
| `SESSION_SECRET` | Yes | Secret used to encrypt session cookies. Must be a random string of at least 32 characters. Rotate periodically. | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` | **Critical** — server-side only |
| `CSRF_SECRET` | Yes | Secret used to sign Cross-Site Request Forgery tokens. Must be a random string of at least 32 characters. | `q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2` | **Critical** — server-side only |

## Didit KYC

| Variable | Required | Description | Example Value | Security |
|----------|----------|-------------|---------------|----------|
| `DIDIT_API_KEY` | Yes | Didit API key for identity verification and KYC (Know Your Customer) checks on seller accounts. | `didit_live_abc123def456` | **Secret** — server-side only |
| `DIDIT_WEBHOOK_SECRET` | Yes | Secret used to verify incoming webhooks from Didit for KYC status updates. | `whsec_abc123def456` | **Secret** — server-side only |

## Feature Flags

| Variable | Required | Description | Example Value | Security |
|----------|----------|-------------|---------------|----------|
| `NEXT_PUBLIC_ENABLE_BETA_FEATURES` | No | Toggles beta/experimental features in the UI. Set to `false` in production. | `false` | Public — exposed to browser |
| `ENABLE_MAINTENANCE_MODE` | No | When `true`, redirects all traffic to a maintenance page. | `false` | **Secret** — server-side only |
| `ENABLE_RATE_LIMITING` | No | Enables rate limiting middleware globally. Always `true` in production. | `true` | **Secret** — server-side only |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | No | Enables Google Analytics tracking. Set to `true` in production. | `true` | Public — exposed to browser |
| `ENABLE_DEBUG_LOGGING` | No | Enables verbose debug logging. Set to `false` in production. | `false` | **Secret** — server-side only |

## Configuration

| Variable | Required | Description | Example Value | Security |
|----------|----------|-------------|---------------|----------|
| `NEXT_PUBLIC_SITE_NAME` | No | Human-readable site name used in SEO metadata and email templates. | `Kisii E-Commerce Ladies` | Public — exposed to browser |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | No | Site description used in SEO meta tags. | `Empowering women entrepreneurs in Kisii through online commerce` | Public — exposed to browser |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Public contact email displayed on the site. | `hello@kisii-ecommerce-ke.com` | Public — exposed to browser |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | No | Support email address used in customer-facing communications. | `support@kisii-ecommerce-ke.com` | Public — exposed to browser |
| `MAX_FILE_UPLOAD_SIZE_MB` | No | Maximum file upload size in megabytes for product images and documents. | `10` | **Secret** — server-side only |
| `PAGINATION_DEFAULT_PAGE_SIZE` | No | Default number of items per page in list views. | `20` | Public — exposed to browser |

## Cloudflare Pages-Specific

The following variables are configured in the Cloudflare Pages dashboard (not in `.env.local`):

| Variable | Description |
|----------|-------------|
| `CLOUDFLARE_API_TOKEN` | API token for wrangler/CI/CD deployments with Pages write permission |
| `CF_PAGES_BRANCH` | Set automatically by Cloudflare — the branch being deployed |
| `CF_PAGES_COMMIT_SHA` | Set automatically by Cloudflare — the commit SHA being deployed |
| `CF_PAGES_URL` | Set automatically by Cloudflare — the preview deployment URL |

## Security Classification Guide

| Classification | Definition | Storage | Examples |
|----------------|------------|---------|----------|
| Public | Safe to expose in client-side code. Cannot be used to access or modify data without additional auth. | `.env.local`, Cloudflare env vars, client bundle | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` |
| Secret | Must never be exposed to the browser. Used for server-side API calls only. | `.env.local`, Cloudflare secrets (encrypted) | `RESEND_API_KEY`, `GROQ_API_KEY`, `CLOUDINARY_API_SECRET` |
| Critical | Highest sensitivity. Exposure allows full system compromise. Must be rotated immediately if leaked. | `.env.local` (never committed), Cloudflare secrets (encrypted), vault/screts manager | `SESSION_SECRET`, `CSRF_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` |

## Validation

Before deploying, validate all required variables are set:

```bash
# Check for missing required variables
grep -r "process.env\." lib/ app/ --include='*.ts' --include='*.tsx' | grep -v "NEXT_PUBLIC_" | sort -u
```

For server-side variables, verify they are set in the Cloudflare Pages dashboard under **Settings > Environment variables > Production**.
