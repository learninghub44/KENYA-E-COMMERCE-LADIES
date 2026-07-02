# Deployment Guide — Cloudflare Pages

## Prerequisites

Install the following tools before proceeding:

| Tool | Version | Verification |
|------|---------|--------------|
| Node.js | >= 18.17 | `node --version` |
| pnpm | >= 8.0 | `pnpm --version` |
| Git | >= 2.30 | `git --version` |
| Wrangler CLI | >= 3.0 | `npx wrangler --version` |

Required accounts and projects:

- **Cloudflare account** — with Pages feature enabled and custom domain added
- **Supabase project** — production project created with database migrations ready
- **Cloudinary account** — with signed upload preset configured for production
- **Resend account** — API key generated for transactional emails
- **Groq account** — API key for AI features
- **Google Analytics** — Measurement ID for production property

## Environment Setup

### 1. Clone repository

```bash
git clone <repository-url> kenya-e-commerce-ladies
cd kenya-e-commerce-ladies
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

Copy the example file and populate with production values:

```bash
cp .env.example .env.local
```

See [environment-variables.md](./environment-variables.md) for a complete reference of all required variables.

### 4. Verify environment

```bash
pnpm run env:validate
```

## Build Process

### 1. TypeScript check

```bash
pnpm typecheck
# Expected: No errors found
```

### 2. Lint

```bash
pnpm lint
# Expected: No errors or warnings
```

### 3. Run tests

```bash
# Unit and integration tests
pnpm test

# UI component tests
pnpm test:ui

# Expected: All tests passing
```

### 4. Production build

```bash
pnpm build
# Expected: Build completed successfully, output in .next/
```

The build output directory is `.next/` as configured in `next.config.js`.

## Deploy to Cloudflare Pages

### 1. Configure wrangler.toml

Create or update `wrangler.toml` at the project root:

```toml
name = "kenya-e-commerce-ladies"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

pages_build_output_dir = ".next"

[env.production]
routes = [
  { pattern = "/*", script = "pages-function" }
]

[env.preview]
routes = [
  { pattern = "/*", script = "pages-function" }
]

[[d1_databases]]
binding = "DB"
database_name = "kenya-ecommerce"
database_id = "<your-database-id>"
```

### 2. Set Cloudflare Pages secrets

```bash
npx wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY --env production
npx wrangler pages secret put RESEND_API_KEY --env production
npx wrangler pages secret put CLOUDINARY_API_SECRET --env production
npx wrangler pages secret put GROQ_API_KEY --env production
npx wrangler pages secret put SESSION_SECRET --env production
npx wrangler pages secret put CSRF_SECRET --env production
```

Public variables are set in the Cloudflare Pages dashboard under **Settings > Environment variables**.

### 3. Deploy via Wrangler CLI

```bash
npx wrangler pages deploy .next --project-name kenya-e-commerce-ladies --branch main
```

### 4. Deploy via CI/CD (Recommended)

Push to the `main` branch triggers automatic deployment via GitHub Actions or the Cloudflare Pages Git integration.

Example GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy .next --project-name kenya-e-commerce-ladies --branch main
```

### 5. Configure custom domain

In Cloudflare Pages dashboard:
1. Navigate to your project → **Custom domains**
2. Add your domain (e.g., `kisii-ecommerce-ke.com`)
3. Update DNS records to point to Cloudflare (if not already proxied)
4. Wait for SSL certificate provisioning (typically < 5 minutes)

## Database Migration

### 1. Link local project to Supabase

```bash
supabase link --project-ref <your-supabase-project-ref>
```

### 2. Push migrations

```bash
supabase db push
```

Apply migrations in order of creation timestamp. The `supabase db push` command handles ordering automatically.

### 3. Verify migration status

```bash
supabase db status
```

All migrations should show as `Applied`.

### 4. Apply RLS policies

```bash
supabase db push --include-all
```

### 5. Seed reference data (if applicable)

```bash
supabase db seed
```

### 6. Verify database state

Connect to the production database and run verification queries:

```sql
SELECT * FROM information_schema.tables WHERE table_schema = 'public';
SELECT count(*) FROM supabase_migrations.schema_migrations;
```

## Post-Deployment Verification

### Health checks

Verify the following endpoints return 200:

```bash
curl -I https://<your-domain>/api/health
curl -I https://<your-domain>/
curl -I https://<your-domain>/api/products?limit=1
```

### Smoke tests

Run the smoke test suite against production:

```bash
pnpm test:e2e -- --base-url https://<your-domain>
```

Manual smoke test checklist:

- [ ] Homepage loads without console errors
- [ ] Product listing page renders with real data
- [ ] Product detail page loads with images, description, and price
- [ ] User registration and login flow works
- [ ] Adding item to cart and proceeding to checkout works
- [ ] Search returns relevant results
- [ ] Seller dashboard loads and displays analytics
- [ ] Admin panel accessible with admin credentials
- [ ] Images load from Cloudinary CDN
- [ ] Email notifications sent (welcome email, order confirmation)

### Monitoring verification

- [ ] Error tracking captures a test error (generate a 404 and confirm it appears in dashboard)
- [ ] Performance monitoring shows real-user data
- [ ] Uptime monitor confirms site is reachable
- [ ] Cloudflare analytics show traffic

## Rollback Procedure

If deployment issues are detected:

### Application rollback

```bash
# Revert to previous build via Cloudflare dashboard
# Navigate to project > Deployments > select previous deployment > Deploy
```

Or via CLI:

```bash
npx wrangler pages deploy .next --project-name kenya-e-commerce-ladies --branch <previous-stable-commit>
```

### Database rollback

```bash
# Revert the last migration
supabase db diff --file rollback_<timestamp>
supabase db push
```

### DNS rollback

In Cloudflare dashboard, update DNS record to point to previous hosting provider or a maintenance page.
