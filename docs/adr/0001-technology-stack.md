# ADR-0001: Core Technology Stack

**Status:** Accepted
**Date:** 2026-07-01
**Author:** Chief Software Architect (Agent 0)

## Context

The platform needs a stack that a small number of specialized engineers/agents can build
against consistently, that scales to 1M+ users and 20M+ product listings, and that keeps
future mobile and AI features viable without a rewrite.

## Decision

- Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- Backend: Supabase (Postgres, Row Level Security, Edge Functions)
- Images: Cloudinary
- Auth: Supabase Auth
- Seller verification: Didit KYC
- Analytics: Google Analytics
- Hosting/CDN: Cloudflare
- Version control: GitHub, monorepo (pnpm workspaces + Turborepo)

## Alternatives Considered

- Separate backend service (Node/Express or NestJS) instead of Supabase — rejected for now:
  adds operational surface without a scaling need Supabase can't meet at current targets.
- Microservices from day one — rejected: 13 agents on a modular monolith with clean
  boundaries ships faster and is still extractable later (see `Architecture.md` §7, §10).
- GraphQL API — rejected: REST is sufficient for current consumers and simpler to secure with
  RLS-aligned per-route auth checks.

## Consequences

- All engineers build against one repo, one deploy pipeline, one database.
- Swapping any third-party provider (Cloudinary, Didit, GA) later is contained to
  `packages/integrations` because feature code never calls SDKs directly.
- If a specific module later needs to be extracted into its own service, module boundaries
  defined in `Architecture.md` and `Engineering.md` make that a scoped project, not a rewrite.
