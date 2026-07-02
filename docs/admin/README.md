# Administration Architecture

Agent 07 implements the operational control center as service factories under `lib/admin`.
The services are repository-driven so web routes, Supabase functions, and future mobile admin
clients can share one authorization and audit path.

## Modules

- `createAdminService` provides dashboard metrics, platform search, user administration, seller
  status transitions, product status transitions, order status updates, and order notes.
- Gateways are injected for Agent 2 auth/user actions, Agent 3 seller lifecycle actions, Agent 4
  product lifecycle actions, Agent 5 order actions, reports, messages, and audit writes.
- Dashboard data must come from `DashboardRepository.getMetrics()`. The service does not invent or
  mock analytics.

## Permission Model

All checks use Agent 2 permission utilities, not hardcoded role names.

- Admin dashboard: `admin.access`
- Platform search: `admin.access` and `user.read.support`
- User suspend/reactivate: `user.manage`
- User lock: `security.lockout.manage`
- Force logout: `auth.session.revoke`
- Seller and product moderation: `admin.moderate`
- Order status updates: `order.manage`
- Internal order notes: `admin.support`

The role matrix grants admin and super admin the operational permissions required for platform
search and order administration.

## API Reference

```ts
const service = createAdminService(deps);

service.dashboard(actor);
service.search(actor, { query, status, cursor, limit, sort });
service.suspendUser(actor, userId, reason);
service.reactivateUser(actor, userId);
service.lockUser(actor, userId, reason);
service.forceLogout(actor, userId);
service.transitionSeller(actor, sellerId, "approved" | "rejected" | "suspended", note);
service.transitionProduct(actor, productId, "approved" | "rejected" | "suspended" | "archived", note);
service.transitionOrder(actor, orderId, orderStatus, note);
service.addOrderNote(actor, orderId, note);
```

Every mutating method writes an audit record through `AdminAuditWriter`.
