# Scaling Guide

**Status:** Approved
**Applies to:** Zuri Market
**Full detail:** [`docs/Scalability.md`](../Scalability.md)

## Design targets

Decisions are validated against these target loads, even though initial traffic will be far
lower: 1,000,000+ registered users, 100,000+ verified sellers, 20,000,000+ product listings,
millions of orders per month, millions of buyer-seller messages, and multi-country traffic.

## Core principles

- **Stateless application layer.** Next.js instances hold no session state in memory — all
  state lives in Postgres, Supabase Auth, or the client — so any instance can serve any
  request.
- **Cache aggressively at the edge.** Product listing and catalog pages are cached via
  Cloudflare CDN with explicit revalidation (ISR / cache tags), not fetched fresh per
  request.
- **The database is the constraint to protect.** Every list endpoint is cursor-paginated.
  Every foreign key and commonly-filtered column is indexed in the same migration that adds
  the column.
- **Read/write separation readiness.** Query code goes through a single data-access layer
  per module, so routing reads to a replica later is a config change, not a rewrite.
- **Partition when a table proves it needs it**, not preemptively. Candidates: `orders`,
  `messages`, `product_events`, once they cross tens of millions of rows.

## Search, media, and messaging at scale

- **Search** starts on Postgres full-text search (`GIN`/`tsvector` indexes), written behind
  an interface so it can be swapped for a dedicated search engine later without touching
  calling code.
- **Media** goes entirely through Cloudinary — responsive sizing, format negotiation
  (AVIF/WebP), CDN delivery. The application never serves raw uploaded images itself.
- **Messaging** uses Postgres with Supabase Realtime subscriptions at the current scale
  target, isolated behind its own interface so it can move to a dedicated store if message
  volume outgrows Postgres.

## Background work

Anything not required for the immediate HTTP response — emails, notifications, analytics
events, image post-processing callbacks — runs in Edge Functions triggered by database
events or queues, never inline in the request path.

## Horizontal scaling checklist (for every new feature)

- [ ] No in-memory state that assumes a single server instance
- [ ] List endpoints are paginated
- [ ] New columns used in `WHERE`/`ORDER BY` are indexed
- [ ] Expensive computed values are cached or precomputed, not computed per request
- [ ] Third-party calls go through the integration adapter, with timeouts and retries

## Future extraction path

Because modules are dependency-isolated (see [Architecture Summary](./ArchitectureSummary.md)),
any module — `orders`, `messaging`, `catalog` — can be extracted into its own service later
by standing up the service, pointing its interface adapter at it instead of the local
module, and removing the local module. No other module's code needs to change.

## Related operational detail

Hosting-specific scaling notes (connection pooling, infrastructure sizing) live in
[`docs/production/scaling-guide.md`](../production/scaling-guide.md); cross-check its
assumptions against [Architecture Summary](./ArchitectureSummary.md) and the current
`package.json` before relying on tool-specific details, per the note in the [Deployment
Guide](./DeploymentGuide.md).

## Back to the top

Return to the [project README](../../README.md) or the [project docs index](./README.md).
