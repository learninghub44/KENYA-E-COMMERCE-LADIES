# Store Lifecycle

Store data is persisted in `public.sellers` plus structured `metadata` for fields that are not yet
first-class database columns.

## Core Fields

- Store name and slug
- Description
- Logo URL
- Banner URL
- Business category
- Support email and phone
- Country code and default currency
- Store visibility

## Metadata Fields

- `storeUrl`
- `businessAddress`
- `taxInformation`
- `storePolicies`
- `businessHours`
- `visibility`

These metadata fields are intentionally structured through Zod schemas in `lib/seller/schemas.ts` so
they can be promoted to database columns later without changing request contracts.

## Completion

The dashboard projection calculates profile completion from required and useful store fields. It does
not include sales analytics, product counts, orders, or marketplace storefront data because those are
owned by later agents.
