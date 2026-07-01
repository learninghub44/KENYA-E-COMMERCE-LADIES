# Seller Architecture

The seller platform converts an authenticated buyer profile into a trusted seller account. It builds
on Agent 01 database tables and Agent 02 authentication primitives.

## Owned Components

- `lib/seller`: seller application, store profile, dashboard projection, status transitions, events.
- `lib/kyc`: KYC submission, Didit provider adapter, manual-review fallback, webhook handling.
- `supabase/migrations/202607020001_seller_platform_lifecycle.sql`: enum/index extensions for the seller lifecycle.
- `features/seller`: feature boundary notes for future web/API adapters.

## Dependency Rules

Seller code does not create a new login system. API/page adapters must authenticate with Agent 02,
then call seller services with the authenticated user id. Postgres RLS remains the data boundary.

External KYC calls go through the `KycProvider` interface. Didit is represented by `createDiditProvider`;
when the Didit client is unavailable or fails to create a session, the service records a `manual`
verification with `manual_review` status.

## Public Service Interfaces

- `createSellerService(deps)`
- `createKycService(deps)`
- `createDiditProvider(client)`
- `canTransitionSellerStatus(from, to)`
- `normalizeSellerStatus(status)`

These interfaces are framework agnostic so Next.js route handlers, Supabase functions, and future
mobile API adapters can reuse the same workflow.
