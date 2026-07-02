# Future Extensions

Deliberately out of scope for Agent 06, left as extension points:

- **Notification delivery** — subscribe to `MessagingEventPublisher` events and send
  push/email/SMS. Do not add delivery logic inside `lib/messaging`.
- **AI moderation** — consume `message_moderation_events` (`suspicious_content`, `reported`) and
  act on them (hide, flag, escalate). The event hooks already exist; the classifier does not.
- **User blocking** — `user_blocked` moderation event type exists as a placeholder; no blocking
  table, enforcement, or UI exists yet. A future agent should add a `blocked_users` table and
  check it in `message-service.ts`'s participant checks.
- **Voice / video / non-image file attachments** — explicitly excluded per the Agent 06 brief.
  `AttachmentProvider` is image-only by design (`mime_type like 'image/%'` DB constraint).
- **Real-time delivery** (WebSocket/SSE push of new messages) — the service layer is
  transport-agnostic; a real-time layer can call `send()`/`markRead()` the same way an HTTP route
  handler would and separately push the result to connected clients.
- **Admin moderation tools** (Agent 07) — can build on top of `message_moderation_events` and the
  staff-only RLS policies without modifying anything in `lib/messaging` or `features/messages`.
- **Route handlers** — `app/api` does not exist in this repository yet (same limitation Agent 05
  noted). `docs/messaging/api-reference.md` documents the service methods a future route scaffold
  should wire up.
