# Roadmap

This roadmap reflects the current build sequence for the Zuri Market
platform. Scope and ordering may shift as priorities evolve — see
[`GOVERNANCE.md`](./GOVERNANCE.md) for how roadmap changes are decided.

## Status Legend

- ✅ Complete
- 🚧 In Progress
- 📋 Planned

## Platform Build Sequence

| Stage | Area | Status |
| --- | --- | --- |
| Agent 0 | Architecture & foundations | ✅ |
| Agent 1 | Database schema & migrations | ✅ |
| Agent 2 | Authentication | ✅ |
| Agent 3 | Seller onboarding & KYC | ✅ |
| Agent 4 | Marketplace core | ✅ |
| Agent 5 | Cart, checkout & orders | ✅ |
| Agent 6 | Messaging | ✅ |
| Agent 7 | Admin & moderation | ✅ |
| Agent 8 | Notifications & platform communications | ✅ |
| Agent 9 | Reviews, ratings & trust | 🚧 |
| Agent 10+ | Further platform capabilities | 📋 |

## Near-Term Focus

- **Reviews, Ratings & Trust (Agent 9):** buyer/seller review flows,
  rating aggregation, and trust signals across the marketplace.
- **Payments:** ongoing hardening of M-Pesa integration across
  checkout and payout flows.
- **Notifications:** continued refinement of transactional email and
  event-driven notifications introduced in Agent 8.

## Longer-Term Considerations

- Formal trademark registration for "Zuri Market" (see
  [`TRADEMARK.md`](./TRADEMARK.md)).
- Expanded seller analytics and reporting.
- Performance and scaling work as marketplace volume grows.

## How This Roadmap Is Maintained

This is the public/community-facing summary. The authoritative,
continuously-updated internal roadmap — with phase-by-phase exit
criteria — lives at [`docs/Roadmap.md`](./docs/Roadmap.md); this file is
kept in sync with it at a higher level.

This document is updated as major stages complete or priorities change.
Substantive changes are recorded in [`CHANGELOG.md`](./CHANGELOG.md).
Suggestions for roadmap items can be raised via an issue — see
[`SUPPORT.md`](./SUPPORT.md).
