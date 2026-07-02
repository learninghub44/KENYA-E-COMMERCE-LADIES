# Future: Push Notification Integration

Real-time in-app delivery (websockets) and mobile/web push are intentionally out of scope for
Agent 8, matching the same scoping decision Agent 6 made for messaging real-time infrastructure.
This doc exists so the agent that picks this up doesn't have to re-derive the integration
points.

## Where push plugs in

`notificationService.create` / `createMany` (`notification-service.ts`) is the single
choke point every in-app notification passes through, whether it originates from the event
dispatcher or an admin broadcast. A push integration should hook here, not duplicate the event
dispatcher's logic:

```ts
// Sketch, not implemented:
async create(input: CreateNotificationInput): Promise<NotificationRecord> {
  const record = await deps.notifications.create(input);
  await deps.push?.sendToUser(input.userId, toPushPayload(record)); // new optional dependency
  return record;
}
```

## Preference model

`notification_preferences` already has `in_app_enabled`. A push-specific toggle
(`push_enabled`) should be added as its own column/migration rather than overloading
`in_app_enabled`, since a user may want in-app bell notifications without device push, or vice
versa.

## Suggested approach

1. Add a `push_subscriptions` table (user_id, device token/endpoint, platform, created_at).
2. Add a `PushProvider` interface mirroring `EmailProvider`'s shape
   (`send(userId, payload): Promise<{ providerMessageId }>`), so the same
   provider-swap pattern from email applies.
3. Wire it as an additional dependency of `notification-service.ts`, gated by the new
   `push_enabled` preference, following the same preference-gating pattern used for email in
   `dispatcher.ts`.
4. Candidate providers: web push (VAPID) for browser, Expo push for a future React Native app
   given the platform's existing use of Expo elsewhere in the Kenyan-market tooling ecosystem.

## Real-time in-app (websockets)

For instant unread-count/badge updates without a page reload, a Supabase Realtime subscription
on `public.notifications` filtered by `user_id = auth.uid()` is the natural fit, since RLS
already restricts each user to their own rows. This requires no new backend code — it's a
client-side subscription — and can be added independently of push.
