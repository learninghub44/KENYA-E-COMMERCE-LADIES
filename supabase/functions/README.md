# Database Functions

This directory documents database functions owned by Agent 01. No Supabase Edge Functions are implemented in this phase.

## Implemented in Migrations

- `public.set_updated_at()` updates `updated_at` columns through narrowly scoped triggers.
- `public.set_product_search_vector()` maintains product full-text search data.
- `public.current_user_has_role(required_role public.app_role)` checks explicit roles in `user_roles`.
- `public.current_user_is_staff()` wraps admin and moderator checks.
- `public.current_user_can_manage_seller(seller_uuid uuid)` checks seller membership or staff access.
- `public.storage_folder_uuid(object_name text, folder_index integer default 1)` safely extracts UUID path prefixes for storage RLS.

## Ownership Boundary

Authentication flows, JWT claim customization, passwordless login, OAuth, and application session handling belong to Agent 2. Agent 01 only supplies database-side authorization primitives.
