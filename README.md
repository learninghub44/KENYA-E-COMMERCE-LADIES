<div align="center">

<img src="./public/logo.svg" alt="Zuri Market" width="420" />

### Kenya's Marketplace for Women

**Beautiful Shopping. Trusted Sellers.**

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres_%2B_RLS-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![Vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![License](https://img.shields.io/badge/license-Proprietary-6A0E7D)](#license)

</div>

---

## Overview

**Zuri Market** is a multi-vendor e-commerce marketplace built for Kenyan women to
discover fashion, beauty, wellness, and lifestyle products from verified sellers. It's
engineered as a modular monolith designed to scale to 1M+ users, 100K+ sellers, and
20M+ product listings without a rewrite — see [`docs/Architecture.md`](docs/Architecture.md)
for the full system design rationale.

The platform serves three audiences from one codebase:

- **Buyers** — browse, search, and purchase from a storefront organized around Fashion,
  Beauty, Wellness, and Lifestyle categories.
- **Sellers** — onboard (with KYC verification), list products, manage inventory, and
  fulfill orders from a dedicated seller dashboard.
- **Admins** — moderate listings, resolve disputes, and manage platform configuration
  from an internal admin console.

## Preview

<div align="center">
<img src="./branding/social-banner.png" alt="Zuri Market brand banner" width="700" />
</div>

Product UI screenshots will be added to `docs/screenshots/` as storefront, seller, and
admin surfaces stabilize toward release.

## Features

- 🛍️ **Multi-vendor storefront** — category browsing, search, product discovery, and
  collections across Fashion, Beauty, Wellness, and Lifestyle
- 🧾 **Seller platform** — guided onboarding, Didit-powered KYC verification, product and
  inventory management, order fulfillment
- 🛒 **Cart & checkout** — full cart, checkout, and order lifecycle with payment
  orchestration
- 💬 **Buyer–seller messaging** — real-time conversations tied to orders and listings
- ⭐ **Reviews & trust** — product/seller reviews, ratings, and trust signals
- 🔐 **Role-based access** — `buyer`, `seller`, `admin`, and `moderator` roles enforced via
  Postgres Row Level Security *and* mirrored route guards
- 📊 **Admin & analytics** — moderation tools, seller analytics, business intelligence,
  and platform-wide observability
- 🔔 **Notifications** — in-app and transactional notifications across key events
- 📱 **PWA-ready** — installable, offline-aware app shell (`app/manifest.ts`, `app/offline`)
- ♿ **Accessible by default** — skip navigation, reduced-motion support, semantic
  component primitives

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router, React Server Components) |
| UI | [React 19](https://react.dev), [TypeScript](https://www.typescriptlang.org), [Tailwind CSS](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com), [Radix UI](https://www.radix-ui.com) |
| Data fetching | [TanStack Query](https://tanstack.com/query) |
| Forms & validation | [React Hook Form](https://react-hook-form.com), [Zod](https://zod.dev) |
| Charts | [Recharts](https://recharts.org) |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| Database & Auth | [Supabase](https://supabase.com) (Postgres, Row Level Security, Edge Functions, Auth) |
| Media pipeline | [Cloudinary](https://cloudinary.com) |
| Seller KYC | [Didit](https://didit.me) |
| Analytics | Google Analytics |
| Edge / CDN | [Cloudflare](https://www.cloudflare.com) |
| Testing | [Vitest](https://vitest.dev), [Testing Library](https://testing-library.com), Node's built-in test runner |
| Package manager | [pnpm](https://pnpm.io) (workspace) |

## Folder Structure

```
KENYA-E-COMMERCE-LADIES/
├── app/                    # Next.js App Router — routes only
│   ├── (storefront)/       # Public buyer-facing storefront
│   ├── admin/              # Admin console
│   ├── auth/                # Auth flows (login, signup, reset)
│   ├── dashboard/           # Shared authenticated dashboard shell
│   ├── internal/            # Internal tooling
│   ├── seller/              # Seller dashboard
│   ├── layout.tsx / manifest.ts / robots.ts / sitemap.ts
├── features/               # Feature/domain modules (business logic, one folder per domain)
│   ├── marketplace/ · products/ · orders/ · cart/ · checkout/
│   ├── seller/ · admin/ · moderation/ · reviews/ · ratings/
│   ├── messages/ · conversations/ · notifications/
│   ├── search/ · discovery/ · recommendations/
│   ├── analytics/ · forecasting/ · reports/ · audit/
│   └── platform/ · resilience/ · observability/ · monitoring/ · storage/ · jobs/
├── lib/                     # Framework glue, module logic, and integrations per domain
│   ├── auth/ · supabase/ · kyc/ · permissions/ · roles/ · security.ts · seo.ts
│   └── (mirrors most `features/` domains with implementation code)
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── shared/               # App-wide, feature-agnostic components
│   └── layout/ · dashboard/
├── hooks/                    # App-wide hooks
├── middleware/                # Route guards (e.g. `auth-guard.ts`)
├── security/                  # Security headers config
├── database/                  # Database docs and utilities
├── supabase/
│   ├── migrations/            # SQL migrations (source of truth for schema)
│   ├── policies/               # RLS policy documentation
│   ├── functions/              # Edge Functions
│   └── seed/ · tests/
├── scripts/                    # Operational scripts (e.g. `run-supabase-sql.js`)
├── branding/                    # Brand assets & guidelines (this agent's output)
├── docs/                        # Architecture, standards, and per-module documentation
│   ├── Architecture.md · Engineering.md · Repository.md · FolderStructure.md
│   ├── CodingStandards.md · CodingRules.md · APIStandards.md
│   ├── Security.md · Scalability.md · Workflow.md · BranchingStrategy.md
│   ├── ReviewChecklist.md · DefinitionOfDone.md · Contributing.md · Roadmap.md
│   ├── adr/                     # Architecture decision records
│   └── handoffs/                # Per-agent handoff documentation
└── types/                       # Shared TypeScript types
```

See [`docs/FolderStructure.md`](docs/FolderStructure.md) for the target modular layout and
ownership boundaries, and [`docs/Engineering.md`](docs/Engineering.md) for who owns what.

## Installation

**Prerequisites:** Node.js 20+, [pnpm](https://pnpm.io), and a [Supabase](https://supabase.com) project.

```bash
git clone https://github.com/learninghub44/KENYA-E-COMMERCE-LADIES.git
cd KENYA-E-COMMERCE-LADIES
pnpm install
cp .env.example .env.local   # fill in your Supabase/Cloudinary/Didit/GA values
pnpm dev
```

The app runs at `http://localhost:3000`.

## Local Development

```bash
pnpm dev            # start the Next.js dev server
pnpm lint           # ESLint + TypeScript project check
pnpm typecheck       # tsc --noEmit
pnpm test            # domain unit tests (lib/**, middleware/**)
pnpm test:unit        # Vitest unit test suite
pnpm test:watch        # Vitest in watch mode
pnpm build              # production build
pnpm start                # run the production build locally
```

Before opening a pull request, run `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
— see [`docs/Contributing.md`](docs/Contributing.md) for the full workflow and
[`docs/ReviewChecklist.md`](docs/ReviewChecklist.md) / [`docs/DefinitionOfDone.md`](docs/DefinitionOfDone.md)
before requesting review.

## Environment Variables

Copy `.env.example` to `.env.local` and provide the following:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key (client-side, RLS-scoped) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — **server-only**, never expose to the client |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for the media pipeline |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `DIDIT_API_KEY` | Didit KYC API key (seller verification) |
| `DIDIT_WEBHOOK_SECRET` | Secret used to verify Didit webhook signatures |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics measurement ID |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL, used for metadata and absolute links |

Never commit real values for these — `.env.local` is git-ignored. Rotate any credential
immediately if it's ever exposed in a commit, PR, or chat log.

## Deployment

The application is designed to run behind **Cloudflare** (CDN, WAF, DDoS protection) in
front of the Next.js app, with **Supabase** as the sole data and auth layer:

```
Internet Users → Cloudflare (CDN / WAF) → Next.js Application → Supabase (Postgres + RLS + Auth + Edge Functions)
                                                                → Cloudinary (media)
                                                                → Didit (seller KYC)
```

1. Provision a Supabase project and run the migrations in `supabase/migrations/` in order
   (or via `scripts/run-supabase-sql.js`).
2. Set all variables from [Environment Variables](#environment-variables) in your hosting
   provider's environment configuration.
3. Build with `pnpm build` and deploy the standard Next.js production output.
4. Point Cloudflare DNS at your hosting provider and enable the WAF/rate-limiting rules
   described in [`docs/Security.md`](docs/Security.md).

See [`docs/Scalability.md`](docs/Scalability.md) for caching, pagination, and read/write
separation guidance as traffic grows.

## Security

- **Identity:** Supabase Auth is the sole identity provider — no custom password storage.
- **Authorization:** Row Level Security is enabled and forced on every table containing
  user-owned or sensitive data; roles (`buyer`, `seller`, `admin`, `moderator`, `service`)
  are enforced in RLS policies and mirrored in route guards.
- **Data protection:** PII and KYC documents are never logged; payment credentials are
  never stored on our infrastructure.
- **Input handling:** All external input is validated against a schema before use; webhook
  endpoints verify provider signatures.
- **Infrastructure:** Cloudflare WAF and rate limiting sit in front of all public
  endpoints; dependency vulnerabilities are scanned in CI.

Full details: [`docs/Security.md`](docs/Security.md). To report a security issue, see
[Contact](#contact) — please do not open a public issue for vulnerabilities.

## Performance

- Stateless application layer — any instance can serve any request.
- Aggressive edge caching for catalog/listing pages via Cloudflare (ISR / cache tags).
- Cursor-based pagination on every list endpoint, with indexes added in the same
  migration as the column they cover.
- A single data-access layer per module, so routing reads to a replica later is a config
  change, not a rewrite.
- High-growth tables (`orders`, `messages`, `product_events`) are candidates for
  time/seller-range partitioning once they justify it.

Full details: [`docs/Scalability.md`](docs/Scalability.md).

## Documentation

- [`docs/Architecture.md`](docs/Architecture.md) — system design
- [`docs/Engineering.md`](docs/Engineering.md) — who owns what
- [`docs/Repository.md`](docs/Repository.md) — repo layout and rules
- [`docs/FolderStructure.md`](docs/FolderStructure.md) — target app layout
- [`docs/CodingStandards.md`](docs/CodingStandards.md) / [`docs/CodingRules.md`](docs/CodingRules.md)
- [`docs/APIStandards.md`](docs/APIStandards.md)
- [`docs/Security.md`](docs/Security.md) · [`docs/Scalability.md`](docs/Scalability.md)
- [`docs/Workflow.md`](docs/Workflow.md) / [`docs/BranchingStrategy.md`](docs/BranchingStrategy.md)
- [`docs/ReviewChecklist.md`](docs/ReviewChecklist.md) / [`docs/DefinitionOfDone.md`](docs/DefinitionOfDone.md)
- [`docs/EngineeringPrinciples.md`](docs/EngineeringPrinciples.md)
- [`docs/Contributing.md`](docs/Contributing.md) · [`docs/Roadmap.md`](docs/Roadmap.md)
- [`docs/adr/`](docs/adr/) — architecture decision records
- [`docs/handoffs/`](docs/handoffs/) — per-agent build handoffs
- [`branding/BRAND_GUIDELINES.md`](branding/BRAND_GUIDELINES.md) — logo, color, and voice guidelines

## FAQ

**Is this a monorepo?**
The codebase currently lives at the repository root as a single Next.js application.
`docs/FolderStructure.md` describes the target `apps/web` layout as the project grows
toward a workspace structure.

**Why Supabase instead of a self-managed database + ORM?**
Supabase gives us Postgres, Row Level Security, Auth, and Edge Functions as one
integrated layer, which keeps authorization enforced at the database level rather than
solely in application code. See [`docs/Architecture.md`](docs/Architecture.md) for the
full rationale.

**Can I use npm or yarn instead of pnpm?**
The repository is configured as a pnpm workspace (`pnpm-workspace.yaml`,
`pnpm-lock.yaml`). Use pnpm to guarantee consistent installs.

**How do I get seller KYC working locally?**
You'll need a Didit sandbox API key and webhook secret in `.env.local`. See
[`docs/kyc/`](docs/kyc/) for the integration details.

**Where do I raise questions about architecture or cross-module interfaces?**
Open a GitHub issue tagged `interface-request` for cross-module needs, or an ADR
proposal in [`docs/adr/`](docs/adr/) for architectural questions — see
[`docs/Contributing.md`](docs/Contributing.md).

## Contact

- **Repository:** [github.com/learninghub44/KENYA-E-COMMERCE-LADIES](https://github.com/learninghub44/KENYA-E-COMMERCE-LADIES)
- **Maintainer:** [@learninghub44](https://github.com/learninghub44)
- For architecture questions, open an ADR proposal in [`docs/adr/`](docs/adr/).
- For bugs or feature requests, use the templates in `.github/ISSUE_TEMPLATE/`.

## License

This project is proprietary and all rights are reserved by its owner. No license is
granted for use, copying, modification, or distribution without explicit written
permission.

---

<div align="center">

**Discover. Shop. Empower.**

</div>
