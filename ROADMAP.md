# Roadmap

This roadmap reflects the current build sequence for the Zuri Market platform. Scope and ordering may shift as priorities evolve — see [`GOVERNANCE.md`](./GOVERNANCE.md) for how roadmap changes are decided.

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
| Agent 9 | Reviews, ratings & trust | ✅ |
| Agent 10 | Search & discovery | ✅ |
| Agent 11 | Analytics & business intelligence | ✅ |
| Agent 12 | Platform infrastructure & resilience | ✅ |
| Agent 13 | Frontend design system | ✅ |
| Agent 14 | Production hardening & integration | ✅ |

## v1.0 Release

The platform is feature-complete and production-hardened. v1.0 readiness includes:

- ✅ All 15 agent builds integrated and passing
- ✅ Zero TypeScript errors
- ✅ 219+ backend tests, 20 component tests passing
- ✅ Production documentation (12 guides)
- ✅ Security audit and critical fixes applied
- ✅ Brand identity and legal framework
- ⬜ Load testing and benchmark validation
- ⬜ E2E test automation (Playwright)
- ⬜ Final accessibility audit (WCAG 2.2 AA)

## Near-Term Focus

### Mobile Apps
Native mobile applications for iOS and Android using React Native, providing the full Zuri Market experience — browsing, purchasing, messaging, seller management — optimized for mobile-first Kenyan users.

### AI Shopping Assistant
Intelligent conversational assistant powered by Groq AI, helping buyers discover products, get style recommendations, track orders, and receive personalized fashion advice.

### Recommendation Engine
Machine learning-based product recommendations leveraging purchase history, browsing behavior, and collaborative filtering to surface relevant products and increase conversion rates.

### Vendor Advertising
Self-service advertising platform allowing sellers to promote their products through sponsored listings, category placements, and targeted promotions.

### Affiliate Marketplace
Affiliate program enabling content creators, influencers, and bloggers to earn commissions by referring buyers to Zuri Market.

## Longer-Term Considerations

### International Expansion
Multi-currency support, localized payment gateways, and cross-border shipping logistics to serve the broader East African market and eventually the African continent.

### Payments
M-Pesa integration hardening, mobile money orchestration, and additional payment gateway support for seamless checkout.

### Loyalty Program
Points-based loyalty system with tiered rewards, exclusive discounts, and gamified engagement to drive retention and repeat purchases.

### Multi-language Support
Full internationalization with Swahili, French, Portuguese, and other African language translations across all platform surfaces.

### Seller Analytics & Reporting
Expanded seller analytics dashboards with advanced reporting, trend forecasting, inventory intelligence, and competitor benchmarking.

### Performance & Scaling
Ongoing performance optimization, database partitioning, read replica deployment, and CDN tuning as marketplace volume grows.

## How This Roadmap Is Maintained

This is the public/community-facing summary. The authoritative, continuously-updated internal roadmap — with phase-by-phase exit criteria — lives at [`docs/Roadmap.md`](./docs/Roadmap.md); this file is kept in sync with it at a higher level.

Substantive changes are recorded in [`CHANGELOG.md`](./CHANGELOG.md). Suggestions for roadmap items can be raised via an issue — see [`SUPPORT.md`](./SUPPORT.md).
