# Event Analytics

Agent 11C owns the internal event platform for tracking marketplace activity.

This module tracks authentication, marketplace, search, cart, checkout, order, seller, review, messaging, and notification events.

All events are stored in the `internal_events` table with full context (user, seller, session, request, device, source).

Owned paths: `lib/events/`, `app/internal/events/`, `docs/events/`
