# KYC Webhooks

Future Supabase Edge Function or Next.js route:

`POST /api/v1/kyc/didit/webhook`

Auth: provider signature verification, not user session.

The handler should:

1. Verify the Didit webhook signature.
2. Pass the raw payload to `createKycService(...).handleWebhook(payload)`.
3. Map service results to the standard API response shape.
4. Return 2xx only after the verification row and seller KYC status are updated.

## Normalized Payload

The service expects the provider adapter to produce:

- `providerReference`
- `status`
- `rejectionReason`
- `metadata`

## Error Codes

- `VALIDATION_ERROR`: payload could not be normalized.
- `KYC_VERIFICATION_NOT_FOUND`: provider reference does not map to a local verification.

Webhook replay should be safe because updates overwrite the same verification record by provider
reference.
