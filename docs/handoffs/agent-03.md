# Agent 03 Seller Platform & KYC Handoff

## What Was Built

Agent 03 implemented a framework-agnostic seller onboarding and KYC domain layer that builds on the
Agent 01 database foundation and Agent 02 authentication/role primitives.

## APIs Exposed In Code

- `createSellerService`
- `createKycService`
- `createDiditProvider`
- `slugifyStoreName`
- `canTransitionSellerStatus`
- `normalizeSellerStatus`

## Intended HTTP APIs

- `POST /api/v1/seller-applications`
- `POST /api/v1/seller-applications/{sellerId}/submit`
- `PATCH /api/v1/sellers/{sellerId}/store`
- `GET /api/v1/sellers/{sellerId}/dashboard`
- `POST /api/v1/kyc/submissions`
- `GET /api/v1/kyc/sellers/{sellerId}/status`
- `POST /api/v1/kyc/didit/webhook`

The repository still does not contain the documented Next.js route-handler scaffold, so route handlers
were documented rather than added.

## Seller Workflow

Authenticated user applies, receives a draft seller account, is added as seller owner, receives the
seller role, completes store data, submits the application, completes KYC, waits for review, and can be
approved for Agent 04 product publishing.

## KYC Integration Details

Didit is wrapped through `KycProvider`. If Didit is unavailable or session creation fails, the service
creates a manual verification with `manual_review` status. Webhooks normalize Didit statuses and update
both `kyc_verifications` and `sellers.kyc_status`.

## Status Lifecycle

Application statuses:

- `draft`
- `pending`
- `under_review`
- `approved`
- `rejected`
- `suspended`
- `inactive`
- `closed`

Legacy database values remain compatible:

- `pending_kyc` maps to `pending`
- `active` maps to `approved`

KYC statuses:

- `not_started`
- `pending`
- `manual_review`
- `approved`
- `rejected`
- `expired`

## Files Created

- `lib/seller/*`
- `lib/kyc/*`
- `features/seller/README.md`
- `app/(seller)/README.md`
- `docs/seller/*`
- `docs/kyc/*`
- `docs/handoffs/agent-03.md`
- `supabase/migrations/202607020001_seller_platform_lifecycle.sql`

## Tests Completed

`pnpm test` passes with 18 tests.

Covered:

- seller registration/application creation
- duplicate application prevention
- store update permission check
- application submission status transition
- Didit manual fallback
- Didit webhook approval processing
- existing auth, permissions, password policy, and route guard tests

## Known Limitations

- No Next.js route handlers were added because the repo has no `apps/web` or complete `app/api` scaffold.
- No real Didit SDK/client credentials are present; the provider accepts an injected client.
- Admin review UI and staff transition workflows are not implemented.
- Notification engine is not implemented; seller/KYC services only publish placeholder events.
- `develop` does not exist on the remote; this branch was created from the cloned default branch.

## Recommendations For Agent 4

- Allow product publishing only when seller status is `approved` and KYC status is `approved`.
- Consume seller state through `lib/seller` contracts or a seller-owned read adapter.
- Do not query or mutate KYC internals from product code.
- Do not add product, catalog, analytics, or marketplace page logic to seller onboarding services.
