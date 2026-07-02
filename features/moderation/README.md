# Moderation Feature

Moderation services live in `lib/moderation` and own queues, reported message review, message
deletion, user warnings, and messaging privilege suspension.

Product and seller moderation are initiated by `lib/admin` and delegated to Agent 3 and Agent 4
gateways. This prevents duplicate lifecycle logic while keeping moderation actions audited.
