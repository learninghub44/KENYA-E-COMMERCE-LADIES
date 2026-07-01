# Scalability Guidelines

**Status:** Approved

## 1. Targets

Design decisions are validated against these target loads, even though initial traffic will
be far lower:

- 1,000,000+ registered users
- 100,000+ verified sellers
- 20,000,000+ product listings
- Millions of orders/month
- Millions of buyer-seller messages
- Global (multi-country) traffic

## 2. Principles

- **Stateless application layer.** Next.js instances hold no session state in memory; all
  state lives in Postgres, Supabase Auth, or the client. Any instance can serve any request.
- **Cache aggressively at the edge.** Product listing pages and catalog data are cached via
  Cloudflare CDN with explicit revalidation (ISR / cache tags), not fetched fresh per request.
- **Database is the constraint to protect.** Every list endpoint is paginated (cursor-based).
  Every foreign key and every commonly-filtered column has an index, added in the same
  migration that adds the column.
- **Read/write separation readiness.** Query code goes through a single data-access layer per
  module so that routing reads to a replica later is a config change, not a rewrite.
- **Partition when a table proves it needs it**, not preemptively. Candidates at scale:
  `orders`, `messages`, `product_events` — partition by time or by seller range once a table
  crosses tens of millions of rows.

## 3. Search

- Catalog search starts on Postgres full-text search with proper indexes (`GIN`/`tsvector`).
- The `catalog` module's search layer is written behind an interface so it can be swapped for
  a dedicated search engine (e.g. a hosted search service) at scale without touching calling
  code.

## 4. Media

- All product images go through Cloudinary: responsive sizing, format negotiation (AVIF/WebP),
  and CDN delivery. The application never serves raw uploaded images itself.

## 5. Messaging at Scale

- Buyer-seller messaging uses Postgres with realtime subscriptions (Supabase Realtime) for
  the current scale target. The messaging module's storage is isolated behind its own
  interface so it can move to a dedicated store (e.g. a queue/stream-backed system) without
  affecting other modules if message volume outgrows Postgres.

## 6. Background Work

- Anything not required for the immediate HTTP response (emails, notifications, analytics
  events, image post-processing callbacks) runs in Edge Functions triggered by DB events or
  queues — never inline in the request path.

## 7. Horizontal Scaling Checklist (for every new feature)

- [ ] No in-memory state that assumes a single server instance
- [ ] List endpoints are paginated
- [ ] New columns used in `WHERE`/`ORDER BY` are indexed
- [ ] Expensive computed values are cached or precomputed, not computed per-request
- [ ] Third-party calls are behind the `packages/integrations` adapter, with timeouts and
      retries

## 8. Future Extraction Path

Because modules are dependency-isolated (see `Architecture.md` §7), any module — `orders`,
`messaging`, `catalog` — can be extracted into its own service later by: standing up the
service, pointing its interface adapter at the new service instead of the local module, and
removing the local module. No other module's code changes.
