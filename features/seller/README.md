# Seller Feature Boundary

Agent 03 owns seller onboarding, store profile management, seller dashboard state, KYC submission,
and seller lifecycle transitions.

This repository does not yet include the documented Next.js `apps/web` scaffold. Until that exists,
the feature is exposed through framework-agnostic services in:

- `lib/seller`
- `lib/kyc`

Future route handlers under `/api/v1/seller-applications`, `/api/v1/sellers`, and `/api/v1/kyc`
should be thin adapters over those services.
