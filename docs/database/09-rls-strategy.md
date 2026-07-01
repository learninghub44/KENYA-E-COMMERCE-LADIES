# RLS Strategy

## Principle

Row Level Security is the source of truth for authorization. Application route guards are required for user experience and early rejection, but they do not replace RLS.

## Coverage

Every table containing user-owned, seller-owned, staff-only, or sensitive marketplace data must have:

- RLS enabled in the table creation migration.
- At least one explicit policy.
- No accidental public write path.

## Role Model

Application roles are stored separately from Supabase Auth credentials:

- `buyer`
- `seller`
- `admin`
- `moderator`
- `service`

Staff access means `admin` or `moderator` unless a policy explicitly requires admin-only behavior.

## Helper Functions

Policies should use stable helper functions for repeated checks:

- `current_user_has_role(required_role)`
- `current_user_is_staff()`
- `current_user_can_manage_seller(seller_uuid)`

These helpers keep policy definitions readable and consistent across seller-owned tables.

## Policy Families

| Data Type | Read Policy | Write Policy |
|---|---|---|
| Public catalog | Anyone can read active/published records. | Seller or staff only. |
| Buyer private data | Owner or staff can read. | Owner or staff can write. |
| Seller private data | Seller owner/member or staff can read. | Seller owner/member or staff can write. |
| Orders | Buyer, seller, or staff can read. | Buyer creates; seller/staff manage fulfillment fields. |
| Messages | Conversation participants can read. | Authenticated participants can send. |
| Audit logs | Staff only. | Trusted staff/service contexts only. |
| Analytics events | Owner/staff read. | Authenticated or anonymous insert path, depending on API design. |
| CMS/public content | Public reads published content. | Staff writes. |

## Views

Public read views should use `security_invoker = true` so underlying table RLS remains effective.

## Service Role

The service role may be used only in trusted server contexts such as Edge Functions, scheduled jobs, and verified webhooks. It must never be used to bypass RLS for browser-originated user actions.

## Testing Requirements

For each policy family, test:

- Anonymous access.
- Authenticated owner access.
- Authenticated non-owner denial.
- Seller member access.
- Staff access.
- Service job behavior where applicable.
