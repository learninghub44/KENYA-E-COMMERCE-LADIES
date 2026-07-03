<div align="center">

<img src="./public/logo.svg" alt="Zuri Market" width="420" />

### **Beautiful Shopping. Trusted Sellers.**

*Kenya's Marketplace for Women*

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres_%2B_RLS-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![Vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Playwright](https://img.shields.io/badge/e2e-playwright-45BA4B?logo=playwright&logoColor=white)](https://playwright.dev)
[![CodeQL](https://img.shields.io/badge/code_scanning-CodeQL-007ACC?logo=github&logoColor=white)](.github/workflows/codeql.yml)
[![License](https://img.shields.io/badge/license-Proprietary-6A0E7D)](#license)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-6A0E7D?logo=github)](#contributing)

</div>

---

## Overview

**Zuri Market** is a multi-vendor e-commerce marketplace built for Kenyan women to discover fashion, beauty, wellness, and lifestyle products from verified sellers. Engineered as a modular monolith designed to scale to 1M+ users, 100K+ sellers, and 20M+ product listings without a rewrite.

The platform serves three audiences from one codebase:

| Audience | Experience |
|---|---|
| **Buyers** | Browse, search, and purchase from a storefront organized around Fashion, Beauty, Wellness, and Lifestyle categories |
| **Sellers** | Onboard (with Didit KYC verification), list products, manage inventory, and fulfill orders from a dedicated seller dashboard |
| **Admins** | Moderate listings, resolve disputes, manage platform configuration, and access business intelligence from an internal admin console |

<div align="center">
<img src="./branding/social-banner.png" alt="Zuri Market brand banner" width="700" />
</div>

---

## Features

- **Multi-vendor storefront** — category browsing, search, product discovery, and collections across Fashion, Beauty, Wellness, and Lifestyle
- **Seller platform** — guided onboarding, Didit-powered KYC verification, product and inventory management, order fulfillment
- **Cart & checkout** — full cart, checkout, and order lifecycle with payment orchestration
- **Buyer–seller messaging** — real-time conversations tied to orders and listings
- **Reviews & trust** — product/seller reviews, ratings, and trust signals
- **Role-based access** — `buyer`, `seller`, `admin`, and `moderator` roles enforced via Postgres Row Level Security *and* mirrored route guards
- **Admin & analytics** — moderation tools, seller analytics, business intelligence, and platform-wide observability
- **Notifications** — in-app and transactional notifications across key events
- **PWA-ready** — installable, offline-aware app shell (`app/manifest.ts`, `app/offline`)
- **Accessible by default** — skip navigation, reduced-motion support, semantic component primitives, WCAG 2.2 AA commitment
- **Internationalization-ready** — locale-aware formatting for price, date, and number display

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org) (App Router, React Server Components) |
| **UI** | [React 19](https://react.dev), [TypeScript](https://www.typescriptlang.org), [Tailwind CSS](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com), [Radix UI](https://www.radix-ui.com) |
| **Data Fetching** | [TanStack Query](https://tanstack.com/query) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com), [Zod](https://zod.dev) |
| **Charts** | [Recharts](https://recharts.org) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **Database & Auth** | [Supabase](https://supabase.com) (Postgres, Row Level Security, Edge Functions, Auth) |
| **Media Pipeline** | [Cloudinary](https://cloudinary.com) |
| **Seller KYC** | [Didit](https://didit.me) |
| **Email** | [Resend](https://resend.com) |
| **Analytics** | Google Analytics |
| **Edge / CDN** | [Cloudflare](https://www.cloudflare.com) |
| **Testing** | [Vitest](https://vitest.dev), [Testing Library](https://testing-library.com), Node.js built-in test runner |
| **CI** | GitHub Actions (CodeQL analysis) |
| **Package Manager** | [pnpm](https://pnpm.io) (workspace) |

---

## Architecture

```
Internet Users → Cloudflare (CDN / WAF) → Next.js Application → Supabase (Postgres + RLS + Auth + Edge Functions)
                                                               → Cloudinary (media)
                                                               → Didit (seller KYC)
                                                               → Resend (email)
```

- **Stateless application layer** — any instance can serve any request
- **Authorization at the database level** — Row Level Security ensures access control survives application bugs
- **Modular monolith** — domain modules live in `features/` with clear ownership boundaries
- **Event-driven** — domain events flow through a durable event bus to decouple modules

For the full system design, see [`docs/Architecture.md`](docs/Architecture.md).

---

## Folder Structure

```
KENYA-E-COMMERCE-LADIES/
├── app/                    # Next.js App Router — routes only
│   ├── (storefront)/       # Public buyer-facing storefront
│   ├── admin/              # Admin console
│   ├── auth/               # Auth flows (login, signup, reset)
│   ├── dashboard/          # Shared authenticated dashboard shell
│   ├── internal/           # Internal tooling
│   ├── seller/             # Seller dashboard
│   ├── layout.tsx / manifest.ts / robots.ts / sitemap.ts
├── features/               # Feature/domain modules
│   ├── marketplace/ · products/ · orders/ · cart/ · checkout/
│   ├── seller/ · admin/ · moderation/ · reviews/ · ratings/
│   ├── messages/ · conversations/ · notifications/
│   ├── search/ · discovery/ · recommendations/
│   ├── analytics/ · forecasting/ · reports/ · audit/
│   └── platform/ · resilience/ · observability/ · storage/ · jobs/
├── lib/                    # Framework glue, module logic, and integrations
│   ├── auth/ · supabase/ · kyc/ · permissions/ · roles/ · security.ts
│   └── (mirrors most `features/` domains with implementation)
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── shared/             # App-wide, feature-agnostic components
│   └── layout/ · dashboard/
├── hooks/                  # App-wide hooks
├── middleware/              # Route guards (e.g. `auth-guard.ts`)
├── security/               # Security headers configuration
├── database/               # Database documentation and utilities
├── supabase/
│   ├── migrations/         # SQL migrations (source of truth for schema)
│   ├── policies/           # RLS policy documentation
│   ├── functions/          # Edge Functions
│   └── seed/ · tests/
├── scripting/              # Operational scripts
├── branding/               # Brand assets, logos, and guidelines
├── docs/                   # Architecture, standards, and module documentation
│   ├── project/            # Project-level guides (overview, architecture, deployment, etc.)
│   ├── adr/                # Architecture decision records
│   ├── handoffs/           # Per-agent build handoffs
│   └── production/         # Production readiness, runbook, DR plan, etc.
├── public/                 # Static assets (logos, icons, manifest images)
├── types/                  # Shared TypeScript type definitions
├── LICENSE                 # Zuri Market Proprietary Software License
├── COPYRIGHT.md            # Copyright notice
├── TRADEMARK.md            # Trademark policy
└── OWNER.md                # Project ownership
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **pnpm** — install via `npm install -g pnpm` or `corepack enable pnpm`
- **Supabase** project — [create one free](https://supabase.com/dashboard)
- **Cloudinary** account — [sign up](https://cloudinary.com)
- **Didit** API key — for seller KYC verification

### Installation

```bash
git clone https://github.com/learninghub44/KENYA-E-COMMERCE-LADIES.git
cd KENYA-E-COMMERCE-LADIES
pnpm install
cp .env.example .env.local
```

Edit `.env.local` with your service credentials (see [Environment Variables](#environment-variables)), then:

```bash
pnpm dev
```

The application runs at `http://localhost:3000`.

### Database Setup

```bash
# Run all migrations against your Supabase project
npx tsx scripts/run-supabase-sql.js
```

Migrations are versioned in `supabase/migrations/` and run in filename order (date-based numbering).

---

## Environment Variables

Copy `.env.example` to `.env.local` and configure the following:

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key (RLS-scoped) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — **server-only** | ✅ |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret — **server-only** | ✅ |
| `RESEND_API_KEY` | Transactional email delivery | for emails |
| `DIDIT_API_KEY` | Didit KYC API key | for KYC |
| `DIDIT_WEBHOOK_SECRET` | Didit webhook signature secret | for KYC |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics measurement ID | optional |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL for metadata | ✅ |

**Never commit real values.** `.env.local` is git-ignored. Rotate any credential immediately if it is ever exposed.

---

## Development

```bash
pnpm dev               # Start the Next.js development server
pnpm lint              # ESLint + TypeScript project check
pnpm typecheck         # tsc --noEmit
pnpm test              # Domain unit tests (lib/**, middleware/**)
pnpm test:unit         # Vitest unit test suite
pnpm test:watch        # Vitest in watch mode
pnpm build             # Production build
pnpm start             # Run the production build locally
```

Before opening a pull request, run the full suite:

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

See [`docs/project/DevelopmentGuide.md`](docs/project/DevelopmentGuide.md) for the complete development workflow and [`CONTRIBUTING.md`](CONTRIBUTING.md) for contribution guidelines.

---

## Deployment

The platform deploys as a standard Next.js application behind Cloudflare:

1. Provision a Supabase project and run all migrations
2. Configure environment variables in your hosting provider
3. Build with `pnpm build`
4. Deploy the Next.js production output
5. Point Cloudflare DNS at your hosting provider and enable WAF/rate-limiting rules

See [`docs/project/DeploymentGuide.md`](docs/project/DeploymentGuide.md) for the full deployment guide and [`docs/production/deployment-guide.md`](docs/production/deployment-guide.md) for Cloudflare-specific instructions.

### Deployment Architecture

```
                     ┌─────────────────┐
                     │   Cloudflare     │
                     │  CDN / WAF / DDoS│
                     └────────┬────────┘
                              │
                     ┌────────▼────────┐
                     │  Next.js App     │
                     │  (Cloudflare     │
                     │   Pages / Node)  │
                     └────────┬────────┘
                              │
               ┌──────────────┼──────────────┐
               │              │              │
       ┌───────▼──────┐ ┌────▼────┐ ┌───────▼──────┐
       │   Supabase   │ │Cloudinary│ │    Didit     │
       │ Postgres+Auth│ │  Media   │ │  Seller KYC  │
       └──────────────┘ └─────────┘ └──────────────┘
```

---

## Security

- **Identity** — Supabase Auth is the sole identity provider; no custom password storage
- **Authorization** — Row Level Security on every table with user-owned data; roles (`buyer`, `seller`, `admin`, `moderator`) enforced in RLS policies and mirrored in route guards
- **Data protection** — PII and KYC documents are never logged; payment credentials are never stored on our infrastructure
- **Input handling** — all external input validated against a Zod schema; webhook endpoints verify provider signatures
- **Infrastructure** — Cloudflare WAF and rate limiting sit in front of all public endpoints; dependency vulnerabilities scanned in CI
- **CSP** — Content Security Policy configured in `next.config.ts`
- **Responsible disclosure** — see [`SECURITY.md`](SECURITY.md) for our vulnerability reporting process

Full details: [`docs/project/SecurityGuide.md`](docs/project/SecurityGuide.md) and [`docs/production/security-checklist.md`](docs/production/security-checklist.md).

---

## Performance

- **Stateless** — any application instance can serve any request
- **Edge caching** — aggressive edge caching for catalog/listing pages via Cloudflare (ISR / cache tags)
- **Cursor pagination** — every list endpoint uses cursor-based pagination with database indexes
- **Single data-access layer** — routing reads to a replica later is a config change, not a rewrite
- **Partitioning-ready** — high-growth tables (`orders`, `messages`, `product_events`) are candidates for time/seller-range partitioning
- **Image optimization** — Next.js Image component with Cloudinary remote patterns
- **Bundle optimization** — code splitting, tree shaking, and lazy loading via Next.js

Full details: [`docs/project/ScalingGuide.md`](docs/project/ScalingGuide.md) and [`docs/production/scaling-guide.md`](docs/production/scaling-guide.md).

---

## Documentation

| Guide | Description |
|---|---|
| [`docs/project/Overview.md`](docs/project/Overview.md) | Project overview and context |
| [`docs/project/ArchitectureSummary.md`](docs/project/ArchitectureSummary.md) | System architecture summary |
| [`docs/project/DevelopmentGuide.md`](docs/project/DevelopmentGuide.md) | Development workflow and setup |
| [`docs/project/DeploymentGuide.md`](docs/project/DeploymentGuide.md) | Deployment procedures |
| [`docs/project/MaintenanceGuide.md`](docs/project/MaintenanceGuide.md) | Platform maintenance |
| [`docs/project/ScalingGuide.md`](docs/project/ScalingGuide.md) | Scaling strategy |
| [`docs/project/SecurityGuide.md`](docs/project/SecurityGuide.md) | Security architecture |
| [`docs/project/RepositoryStandards.md`](docs/project/RepositoryStandards.md) | Repository conventions |
| [`docs/project/BrandGuide.md`](docs/project/BrandGuide.md) | Brand guidelines reference |
| [`docs/production/`](docs/production/) | Production readiness, runbook, DR plan, monitoring |
| [`docs/adr/`](docs/adr/) | Architecture decision records |
| [`docs/handoffs/`](docs/handoffs/) | Per-agent build handoffs |
| [`branding/BRAND_GUIDELINES.md`](branding/BRAND_GUIDELINES.md) | Logo, color, and voice guidelines |

---

## FAQ

**Is Zuri Market open source?**
No. Zuri Market is proprietary software. See [`LICENSE`](LICENSE) for the full terms.

**Is this a monorepo?**
The codebase currently lives at the repository root as a single Next.js application. Future iterations may adopt a `packages/` workspace structure.

**Why Supabase instead of a self-managed database + ORM?**
Supabase provides Postgres, Row Level Security, Auth, and Edge Functions as one integrated layer, keeping authorization enforced at the database level. See [`docs/Architecture.md`](docs/Architecture.md) for the full rationale.

**Can I use npm or yarn instead of pnpm?**
The repository is configured as a pnpm workspace. Use pnpm for consistent installs.

**How do I get seller KYC working locally?**
You need a Didit sandbox API key and webhook secret in `.env.local`. See the KYC module documentation in `docs/handoffs/`.

**Where do I report a bug?**
Open a GitHub issue using the Bug Report template. See [`SUPPORT.md`](SUPPORT.md).

**I have a security vulnerability to report.**
Do **not** open a public issue. Follow the process in [`SECURITY.md`](SECURITY.md) for responsible disclosure.

---

## Support

- **Bug reports** — use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md)
- **Feature requests** — use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md)
- **Security issues** — follow [`SECURITY.md`](SECURITY.md)
- **General inquiries** — [GitHub Discussions](../../discussions)
- **Commercial licensing** — contact the Owner (see [`OWNER.md`](OWNER.md))

---

## Contact

| Channel | Detail |
|---|---|
| **Repository** | [github.com/learninghub44/KENYA-E-COMMERCE-LADIES](https://github.com/learninghub44/KENYA-E-COMMERCE-LADIES) |
| **Owner** | Chris Odhiambo ([@learninghub44](https://github.com/learninghub44)) |
| **Licensing** | See [`OWNER.md`](OWNER.md) for contact information |

---

## License

Copyright © 2026 Chris Odhiambo. All rights reserved.

**Zuri Market** is proprietary software. No license is granted for use, copying, modification, or distribution without explicit prior written permission from the Owner.

See [`LICENSE`](LICENSE) for the full proprietary license agreement, [`COPYRIGHT.md`](COPYRIGHT.md) for the copyright notice, [`TRADEMARK.md`](TRADEMARK.md) for trademark policy, and [`TERMS_OF_USE.md`](TERMS_OF_USE.md) for terms governing repository access.

---

<div align="center">

**Discover. Shop. Empower.**

Built with ❤️ in Kenya

</div>
