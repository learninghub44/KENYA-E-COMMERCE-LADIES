# Seller API Documentation

The repo does not yet include Next.js route handlers, so these are the contracts future adapters
should expose over `lib/seller` and `lib/kyc`.

## `POST /api/v1/seller-applications`

Auth: authenticated

Creates a draft seller application for the current user.

Request body:

- `storeName`
- `storeDescription`
- `storeUrl`
- `businessCategory`
- `countryCode`
- `defaultCurrency`
- `supportEmail`
- `supportPhone`
- `businessAddress`
- `taxInformation`

Errors: `VALIDATION_ERROR`, `SELLER_ALREADY_EXISTS`, `SESSION_REQUIRED`.

## `POST /api/v1/seller-applications/{sellerId}/submit`

Auth: seller

Moves a draft/rejected application into `pending`.

Errors: `SELLER_NOT_FOUND`, `AUTHORIZATION_DENIED`, `INVALID_STATUS_TRANSITION`.

## `PATCH /api/v1/sellers/{sellerId}/store`

Auth: seller

Updates the store profile and configuration.

Request body:

- `storeName`
- `storeDescription`
- `logoUrl`
- `bannerUrl`
- `storeUrl`
- `businessCategory`
- `supportEmail`
- `supportPhone`
- `businessAddress`
- `storePolicies`
- `businessHours`
- `visibility`

Errors: `VALIDATION_ERROR`, `SELLER_NOT_FOUND`, `AUTHORIZATION_DENIED`, `SELLER_CLOSED`.

## `GET /api/v1/sellers/{sellerId}/dashboard`

Auth: seller

Returns seller overview, application status, KYC status, profile completion, recent activity placeholder,
notification placeholder, and quick actions. Sales analytics are intentionally not included.
