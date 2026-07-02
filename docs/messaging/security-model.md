# Security Model

## Authentication

Route handlers derive the authenticated user from Agent 02's Supabase Auth session — the
messaging service layer never authenticates a request itself, it only authorizes actions given an
already-known `participantId`/role, matching the pattern in `lib/orders/order-service.ts`.

## Authorization

- **Conversations**: only the `buyer_id`, a seller manager of `seller_id`
  (`current_user_can_manage_seller`), or staff (`current_user_is_staff`) may view or act on a
  conversation. Enforced both at the database layer (RLS policies in
  `supabase/migrations/202607020004_messaging_engine.sql`) and again in the service layer, so a
  misconfigured repository adapter cannot silently bypass ownership checks.
- **Messages**: only conversation participants may send or view messages. Only the sender (or
  staff) may edit or delete their own message.
- **Attachments**: visible only to conversation participants; insertable only by the message's
  sender.
- **Moderation events**: readable only by staff; insertable only by the reporting participant
  themselves (`actor_id = auth.uid()`), scoped to messages in conversations they participate in.

## Row Level Security

All four messaging tables (`conversations`, `messages`, `message_attachments`,
`message_moderation_events`) have RLS enabled with no unrestricted policies. Policies reuse the
existing `public.current_user_can_manage_seller(seller_uuid)` and `public.current_user_is_staff()`
helper functions introduced by Agent 01, rather than duplicating role-check logic.

## Input validation

Every service method validates its input through a zod schema (`lib/messaging/schemas.ts`) before
touching a repository — untrusted client input is never passed straight to a database call, per
`docs/CodingStandards.md` §7.
