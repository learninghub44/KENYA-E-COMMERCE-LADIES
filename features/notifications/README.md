# Notifications Feature

Notifications, the platform event bus, email queue, and admin broadcasts are handled by
`lib/notifications`. Every authenticated role can read and manage their own notifications and
preferences (`notification.read.own`, `notification.preferences.manage`); only admins and
super admins can create or publish admin broadcasts (`notification.broadcast.manage`).

Security notifications cannot be disabled by any user.

See `docs/notifications/` for lifecycle, API reference, and email architecture, and
`docs/events/` for the event catalog and flow.
