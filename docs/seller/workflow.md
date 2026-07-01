# Seller Workflow

## Lifecycle

1. Authenticated user applies to become a seller.
2. Seller record is created in `draft`.
3. Owner is added to `seller_members`.
4. Seller role is granted through Agent 02 role infrastructure.
5. Store profile is completed.
6. Seller submits application and moves to `pending`.
7. KYC is submitted through Didit or manual fallback.
8. Application moves to `under_review`.
9. Staff approval moves seller to `approved`.
10. Agent 04 can allow product publishing only when seller status and KYC status are both `approved`.

## Statuses

- `draft`: application started but not submitted.
- `pending`: application submitted by seller.
- `under_review`: application or documents are being reviewed.
- `approved`: seller is trusted and ready for product publishing.
- `rejected`: seller must correct application or KYC issues before resubmission.
- `suspended`: platform temporarily disables seller activity.
- `inactive`: seller is approved but not currently active.
- `closed`: terminal seller account closure.

The migration keeps Agent 01 legacy values `pending_kyc` and `active` available. Application code maps
`pending_kyc` to `pending` and `active` to `approved` for compatibility.

## Events

The seller service publishes placeholders only:

- `seller.application.received`
- `seller.kyc.submitted`
- `seller.kyc.failed`
- `seller.approved`
- `seller.rejected`
- `seller.documents.requested`

The notification engine is intentionally out of scope.
