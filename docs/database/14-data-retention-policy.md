# Data Retention Policy

## Principle

Retain data only as long as required for marketplace operations, legal obligations, user trust, fraud prevention, dispute resolution, and analytics needs.

## Retention Categories

| Data Category | Examples | Default Retention |
|---|---|---|
| Account profile | `profiles`, addresses | Until account deletion or legal erasure request, then anonymize/delete where allowed. |
| Seller records | `sellers`, KYC status, seller members | Account lifetime plus compliance window. |
| KYC references | `kyc_verifications` | Compliance window; prefer provider-hosted documents. |
| Catalog data | products, variants, images, inventory | Seller lifetime; archived records retained for order history. |
| Cart data | carts, cart items | Short-lived; purge abandoned anonymous carts after a defined window. |
| Wishlist data | wishlists, wishlist items | Account lifetime or user deletion. |
| Orders | orders, order items | Long-term retention for tax, disputes, and fraud review. |
| Messages | conversations, messages | Retain for support and disputes; archive old closed threads later. |
| Reviews and reports | reviews, reports | Retain while public or needed for trust and moderation history. |
| Notifications | notifications | Short-to-medium retention; purge old read notifications. |
| Audit logs | audit logs | Long-term security and compliance retention. |
| Activity logs | activity logs | Medium retention; aggregate or purge after operational usefulness. |
| Analytics events | analytics events | Short raw retention, longer aggregated retention. |
| Contact requests | contact requests | Retain through support lifecycle, then archive or delete. |

## PII Handling

PII includes names, addresses, phone numbers, emails, IP addresses, and document-related metadata.

Rules:

- Do not retain PII in logs unless required.
- Do not store raw KYC documents unless required.
- Anonymize before deleting records that must remain for financial or legal reasons.
- Keep deletion and anonymization workflows auditable.

## Future Automation

Retention jobs should run through trusted server-side scheduled jobs or Supabase Edge Functions, never from client code.

Candidate cleanup jobs:

- Abandoned anonymous carts.
- Old read notifications.
- Expired feature flag rollout metadata.
- Raw analytics event compaction.
- Expired private document objects.
