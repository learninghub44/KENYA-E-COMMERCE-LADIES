# Trust Feature

Owns review moderation hooks and trust-facing review status transitions.

`lib/trust/createTrustService` exposes moderation updates for product and seller reviews. It reuses the Agent 7 `admin.moderate` permission pattern and writes admin audit events through the shared audit gateway.

AI moderation, fraud scoring, and review summarization are intentionally out of scope for Agent 09.
