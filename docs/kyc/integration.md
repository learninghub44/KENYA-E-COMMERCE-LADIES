# KYC Integration

KYC is implemented behind a provider interface in `lib/kyc`.

## Didit

`createDiditProvider(client)` wraps a Didit client with two operations:

- `createVerification`: starts a Didit verification session.
- `parseWebhook`: normalizes Didit webhook payloads into project KYC statuses.

Didit statuses are mapped as follows:

- `approved`, `verified`, `completed` -> `approved`
- `rejected`, `declined`, `failed` -> `rejected`
- `manual_review`, `review`, `needs_review` -> `manual_review`
- `expired` -> `expired`
- everything else -> `pending`

## Manual Fallback

If Didit is unavailable or session creation throws, the KYC service records:

- provider: `manual`
- status: `manual_review`
- metadata fallback reason

This keeps seller onboarding moving while preserving review visibility for staff.

## Verification History

Every submission creates a `kyc_verifications` row. The latest record drives current status, while older
records remain available as verification history.
