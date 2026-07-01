# Seller Data Model

Agent 03 uses the existing Agent 01 tables:

- `sellers`
- `seller_members`
- `kyc_verifications`
- `user_roles`
- `profiles`

## `sellers`

Stores seller identity, owner, store profile basics, lifecycle status, KYC status, country/currency, and
structured metadata.

Agent 03 migration adds lifecycle enum values:

- `pending`
- `under_review`
- `approved`
- `rejected`
- `inactive`

The migration also adds `manual_review` to `kyc_status`.

## `seller_members`

Stores membership between seller accounts and users. Agent 03 creates an owner member on application
creation. Future team management can extend this with manager/staff workflows.

## `kyc_verifications`

Stores every verification attempt with provider, provider reference, status, rejection reason, and
metadata. This supports retries, resubmission, webhook replay, manual review, and verification history.

## Metadata Shape

Seller metadata currently stores:

- `storeUrl`
- `businessCategory`
- `businessAddress`
- `taxInformation`
- `storePolicies`
- `businessHours`
- `visibility`

These fields are validated by `lib/seller/schemas.ts`.
