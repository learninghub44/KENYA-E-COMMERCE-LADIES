# API Standards

**Status:** Approved

## 1. Shape

- REST over HTTP, implemented as Next.js route handlers under `app/api/`.
- One API serves the web app, future mobile apps, and future partner integrations — no
  separate "internal" vs "mobile" API.
- Base path is versioned: `/api/v1/...`. A breaking change requires `/api/v2/...`, not a
  breaking change to `v1`, and requires an ADR.

## 2. Resource Naming

- Nouns, plural, kebab-case: `/api/v1/products`, `/api/v1/seller-applications`.
- Nesting reflects real ownership, max two levels:
  `/api/v1/sellers/{sellerId}/products` is fine; deeper nesting means the resource needs its
  own top-level route with a filter query param instead.
- Actions that aren't pure CRUD are modeled as sub-resources or verbs on a resource, not as
  RPC-style endpoints: `POST /api/v1/orders/{orderId}/cancel`, not
  `/api/v1/cancelOrder`.

## 3. Request/Response Contract

- Every request body and response body is validated against a Zod schema shared between the
  route handler and its type export in `packages/types`.
- Successful responses:
  ```json
  { "data": { ... }, "meta": { ... } }
  ```
- Error responses use a consistent shape and real HTTP status codes:
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "...", "details": { } } }
  ```
- Pagination uses cursor-based pagination for any list endpoint that can grow unbounded
  (products, orders, messages): `?cursor=...&limit=...`, response includes `meta.nextCursor`.
- Timestamps are ISO 8601 UTC. Money values are integers in the smallest currency unit
  (e.g. cents) with an explicit `currency` field — never floats.

## 4. Auth

- Every route handler declares its required auth level explicitly at the top:
  public, authenticated, seller, admin. There is no implicit "assume logged in."
- Authorization is enforced twice: at the route handler (fast fail) and at the database via
  RLS (source of truth). The route handler check is a UX optimization, not the security
  boundary.

## 5. Idempotency

- All mutating endpoints that trigger payments or external side effects
  (checkout, KYC submission) accept an `Idempotency-Key` header and de-duplicate on it.

## 6. Documentation

- Every route handler is documented with its method, path, auth level, request schema,
  response schema, and error codes, either in a doc comment or an OpenAPI fragment maintained
  by the owning agent. The API Integration Engineer maintains the aggregated OpenAPI spec.

## 7. Versioning and Deprecation

- Deprecated endpoints are marked with a `Deprecation` response header and a sunset date,
  minimum 90 days before removal, announced in `docs/adr/`.
