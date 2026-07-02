# Frontend Architecture

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 15** (App Router) | React framework with server components, file-based routing, API routes |
| **TypeScript** | Type safety across the entire codebase |
| **Tailwind CSS v3** | Utility-first CSS with `class`-based dark mode |
| **shadcn/ui** | 33 Radix-based UI components, fully customizable via `components/ui/` |
| **TanStack Query (React Query v5)** | Server state management, caching, background refetching |
| **Framer Motion v12** | Declarative animations, page transitions, `useInView` scroll effects |
| **Lucide React** | Icon library (~0.511.0), tree-shakeable via Next.js experimental `optimizePackageImports` |
| **Supabase JS** | Auth client, backend integration |
| **React Hook Form + Zod** | Form validation and schema parsing |
| **Sonner** | Toast notifications |
| **Recharts** | Dashboard charts (admin/seller analytics) |
| **next-themes** | Light/dark/system theme toggling |

## Directory Structure

```
app/                        # Next.js App Router pages and API routes
├── (storefront)/           # Route group — customer-facing pages
│   ├── _components/        # (private) page-specific components
│   ├── layout.tsx          # StorefrontLayout (AnnouncementBar + Navbar + Footer)
│   ├── page.tsx            # Home / landing page
│   ├── account/            # Profile, addresses, security, recently-viewed
│   ├── cart/
│   ├── categories/[slug]/
│   ├── checkout/
│   ├── messages/
│   ├── notifications/
│   ├── order-success/[id]/
│   ├── orders/ & orders/[id]/
│   ├── products/[slug]/
│   ├── search/
│   ├── sellers/[slug]/
│   └── wishlist/
├── admin/                  # Admin dashboard (platform operators)
│   ├── layout.tsx          # AdminLayout (sidebar + top bar)
│   ├── page.tsx            # Dashboard home
│   ├── analytics/
│   ├── business-intelligence/
│   ├── moderation/
│   ├── notifications/
│   ├── orders/
│   ├── platform/           # health, diagnostics, feature-flags
│   ├── products/
│   ├── reviews/
│   ├── search-analytics/
│   ├── sellers/
│   ├── settings/
│   └── users/
├── auth/                   # Auth pages and callback route
│   ├── callback/route.ts
│   ├── forgot-password/
│   ├── login/
│   ├── register/
│   └── reset-password/
├── seller/                 # Seller dashboard
│   ├── layout.tsx          # SellerLayout (sidebar + top bar)
│   ├── page.tsx            # Dashboard home
│   ├── analytics/
│   ├── coupons/
│   ├── inventory/
│   ├── kyc/
│   ├── messages/
│   ├── orders/
│   ├── products/ & products/new/ & products/[id]/edit/
│   ├── reviews/
│   ├── settings/
│   └── store/
├── internal/platform/      # Internal API routes (monitoring, jobs, etc.)
├── offline/                # Offline fallback page (PWA)
├── layout.tsx              # Root layout (Providers, metadata, fonts)
├── manifest.ts             # PWA manifest generator
├── globals.css             # Global styles, CSS variables, Tailwind directives
├── not-found.tsx           # 404 page
├── error.tsx               # Global error boundary
└── loading.tsx             # Root loading state

components/
├── ui/                     # 33 shadcn/ui primitives (button, card, dialog, etc.)
├── shared/                 # 10 domain-agnostic shared components
│   ├── product-card.tsx
│   ├── rating.tsx
│   ├── price.tsx
│   ├── breadcrumbs.tsx
│   ├── empty-state.tsx
│   ├── error-state.tsx
│   ├── loading.tsx
│   ├── search-command.tsx
│   ├── theme-provider.tsx
│   └── providers.tsx
└── layout/                 # Layout-specific components (10)
    ├── announcement-bar.tsx
    ├── navbar.tsx
    ├── footer.tsx
    ├── mega-menu.tsx
    ├── mobile-nav.tsx
    ├── search-bar.tsx
    ├── search-trigger.tsx
    ├── cart-button.tsx
    ├── account-dropdown.tsx
    └── theme-toggle.tsx

hooks/                      # Custom React hooks (empty — pending implementation)
lib/
├── client/                 # Client-side utilities (empty — pending implementation)
├── auth/                   # Auth helpers, session management
├── cart/                   # Cart state management
├── checkout/               # Checkout flow
├── marketplace/            # Search, wishlist services
├── orders/                 # Order processing
├── products/               # Product queries
├── seller/                 # Seller operations
├── utils.ts                # cn() utility (clsx + tailwind-merge)
└── ...                     # Additional domain libraries

types/                      # Shared TypeScript types (auth, roles, permissions)
styles/                     # Additional styles (empty — Tailwind used primarily)
public/
├── icons/                  # PWA icons (9 sizes: 48x48 to 512x512)
└── sw.js                   # Service worker
```

## Key Design Decisions

### Route Groups (`(storefront)`)
Storefront pages are wrapped in a parenthesized route group to share a layout without affecting the URL path. The same pattern would apply to authenticated buyer routes if needed.

### Design System via shadcn/ui
Rather than a custom component library, the project uses shadcn/ui for 33 primitives. These are copied into `components/ui/`, fully owned and customizable. Variants are defined with CVA (class-variance-authority). Themed via CSS custom properties in `globals.css`.

### Multi-Role Layouts
Three distinct layouts serve three user personas:
- **Storefront** — public-facing, SEO-optimized, marketing-focused
- **Admin** — platform operations, sidebar nav with grouped sections
- **Seller** — merchant dashboard, streamlined sidebar

### PWA Support
Next.js `manifest.ts` generates a web manifest. A service worker (`public/sw.js`) provides offline caching and fallback. The `/offline` route serves a dedicated offline page.

### Performance Optimizations
- `next.config.ts` enables `optimizePackageImports` for `lucide-react`, `framer-motion`, `recharts`, `@radix-ui/react-icons`
- TanStack Query with 60s default `staleTime` and `refetchOnWindowFocus: false`
- DM Sans font loaded via Google Fonts with `preconnect` hints
- Images use `next/image` with Cloudflare remote patterns

## Running the Project

```bash
# Development
pnpm dev          # Start Next.js dev server (default: localhost:3000)

# Production build
pnpm build        # Build for production
pnpm start        # Start production server

# Code quality
pnpm lint         # ESLint + TypeScript check
pnpm typecheck    # TypeScript type checking only
pnpm test         # Run unit tests (lib/**/*.test.ts, middleware/**/*.test.ts)
```

## Detailed Docs

| Doc | Description |
|---|---|
| [Design System](./design-system.md) | Theming, colors, typography, component catalog |
| [Layout](./layout.md) | Layout hierarchy, navigation components, breakpoints |
| [Routes](./routes.md) | Complete route map with descriptions and components |
| [PWA](./pwa.md) | Progressive Web App configuration |
| [Accessibility](./accessibility.md) | WCAG AA compliance, current state, roadmap |
