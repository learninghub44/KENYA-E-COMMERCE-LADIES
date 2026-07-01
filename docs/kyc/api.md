# KYC API Documentation

The repo does not yet include Next.js route handlers, so these are service-backed route contracts.

## `POST /api/v1/kyc/submissions`

Auth: seller

Starts identity verification and optional future business verification.

Headers:

- `Idempotency-Key`: required once a route adapter is implemented because this endpoint can call Didit.

Request body:

- `sellerId`
- `documents`
- `businessVerificationRequested`

Errors: `VALIDATION_ERROR`, `SELLER_NOT_FOUND`, `AUTHORIZATION_DENIED`, `SELLER_NOT_ELIGIBLE`,
`KYC_ALREADY_APPROVED`.

## `GET /api/v1/kyc/sellers/{sellerId}/status`

Auth: seller

Returns the latest verification record or `null` if not submitted.

Errors: `SELLER_NOT_FOUND`, `AUTHORIZATION_DENIED`.

## `POST /api/v1/kyc/didit/webhook`

Auth: Didit signature

Normalizes provider status and updates both `kyc_verifications` and `sellers.kyc_status`.
