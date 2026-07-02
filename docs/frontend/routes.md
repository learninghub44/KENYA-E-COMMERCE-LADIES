# Routes

## Storefront Routes (22 pages)

Route group: `app/(storefront)/` — inherits `StorefrontLayout` (AnnouncementBar + Navbar + Footer).

| Route | File | Description | Key Components |
|---|---|---|---|
| `/` | `page.tsx` | Landing page — hero, category cards, trending products, newsletter | ProductCard, Rating, Price, Card, Badge |
| `/cart` | `cart/page.tsx` | Shopping cart with items, quantities, totals | Button, Card, Input, Separator |
| `/checkout` | `checkout/page.tsx` | Multi-step checkout | Button, Input, Label, RadioGroup, Select |
| `/search` | `search/page.tsx` | Search results with filters | ProductCard, Input, Slider, Checkbox, Pagination |
| `/wishlist` | `wishlist/page.tsx` | User's saved items | ProductCard, EmptyState |
| `/messages` | `messages/page.tsx` | Buyer-seller messaging | Card, Avatar, Input, Button |
| `/notifications` | `notifications/page.tsx` | Notification history | Card, Badge, Tabs |
| `/orders` | `orders/page.tsx` | Order history list | Card, Badge, Tabs, Pagination |
| `/orders/[id]` | `orders/[id]/page.tsx` | Single order detail | Card, Badge, Separator, Button |
| `/order-success/[id]` | `order-success/[id]/page.tsx` | Post-checkout confirmation | Card, Button, Badge |
| `/categories/[slug]` | `categories/[slug]/page.tsx` | Category listing with filters | ProductCard, Breadcrumbs, Slider, Checkbox |
| `/products/[slug]` | `products/[slug]/page.tsx` | Product detail page | Rating, Price, Button, Tabs, Accordion, Breadcrumbs |
| `/sellers/[slug]` | `sellers/[slug]/page.tsx` | Seller storefront | ProductCard, Rating, Tabs |
| `/account` | `account/page.tsx` | Account overview / dashboard | Card, Button, Tabs |
| `/account/profile` | `account/profile/page.tsx` | Edit personal information | Input, Label, Button, Form |
| `/account/addresses` | `account/addresses/page.tsx` | Saved addresses management | Card, Button, Dialog, Input |
| `/account/security` | `account/security/page.tsx` | Password, 2FA, sessions | Input, Button, Switch, Separator |
| `/account/recently-viewed` | `account/recently-viewed/page.tsx` | Recently browsed products | ProductCard, EmptyState |

## Admin Routes (16 pages)

Route group: `app/admin/` — inherits `AdminLayout` (sidebar + top bar). All pages are `"use client"`.

| Route | File | Description | Key Components |
|---|---|---|---|
| `/admin` | `page.tsx` | Dashboard — KPIs, charts, recent activity | Card, Badge, Table, Recharts |
| `/admin/analytics` | `analytics/page.tsx` | Traffic, sales, conversion analytics | Card, Tabs, Recharts, Select |
| `/admin/business-intelligence` | `business-intelligence/page.tsx` | BI reports and insights | Card, Table, Tabs |
| `/admin/moderation` | `moderation/page.tsx` | Content moderation queue | Card, Badge, Button, Tabs, Table |
| `/admin/notifications` | `notifications/page.tsx` | System notifications | Card, Badge, Tabs |
| `/admin/orders` | `orders/page.tsx` | All platform orders | Card, Badge, Table, Pagination, Select |
| `/admin/platform/health` | `platform/health/page.tsx` | System health monitoring | Card, Progress, Badge |
| `/admin/platform/diagnostics` | `platform/diagnostics/page.tsx` | System diagnostics | Card, Table, Badge |
| `/admin/platform/feature-flags` | `platform/feature-flags/page.tsx` | Feature flag management | Card, Switch, Badge, Button |
| `/admin/products` | `products/page.tsx` | All marketplace products | Card, Badge, Table, Pagination |
| `/admin/reviews` | `reviews/page.tsx` | Review moderation | Card, Rating, Badge, Button |
| `/admin/search-analytics` | `search-analytics/page.tsx` | Search term analytics | Card, Table, Recharts |
| `/admin/sellers` | `sellers/page.tsx` | Seller management | Card, Badge, Table, Button |
| `/admin/settings` | `settings/page.tsx` | Platform settings | Input, Switch, Tabs, Button, Separator |
| `/admin/users` | `users/page.tsx` | User management | Card, Badge, Table, Pagination, Button |

## Seller Routes (15 pages)

Route group: `app/seller/` — inherits `SellerLayout` (sidebar + top bar).

| Route | File | Description | Key Components |
|---|---|---|---|
| `/seller` | `page.tsx` | Dashboard — sales, orders, visitors | Card, Badge, Recharts |
| `/seller/products` | `products/page.tsx` | Product listings management | Card, Badge, Table, Button |
| `/seller/products/new` | `products/new/page.tsx` | Create new product | Input, Select, Textarea, Button, Form |
| `/seller/products/[id]` | `products/[id]/page.tsx` | Product detail view | Card, Badge, Button |
| `/seller/products/[id]/edit` | `products/[id]/edit/page.tsx` | Edit existing product | Input, Select, Textarea, Button, Form |
| `/seller/orders` | `orders/page.tsx` | Order management | Card, Badge, Table, Select |
| `/seller/inventory` | `inventory/page.tsx` | Stock management | Card, Input, Button, Table, Badge |
| `/seller/analytics` | `analytics/page.tsx` | Sales & traffic analytics | Card, Tabs, Recharts |
| `/seller/coupons` | `coupons/page.tsx` | Discount coupon management | Card, Button, Dialog, Input |
| `/seller/messages` | `messages/page.tsx` | Buyer conversations | Card, Avatar, Input |
| `/seller/reviews` | `reviews/page.tsx` | Product reviews | Card, Rating, Badge, Button |
| `/seller/store` | `store/page.tsx` | Store profile settings | Input, Textarea, Button, Card |
| `/seller/kyc` | `kyc/page.tsx` | KYC verification | Card, Input, Button, File upload |
| `/seller/settings` | `settings/page.tsx` | Seller account settings | Input, Switch, Tabs, Button |

## Auth Routes (5 pages)

| Route | File | Description | Key Components |
|---|---|---|---|
| `/auth/login` | `login/page.tsx` | Sign in (email + magic link) | Input, Label, Button, Card, Form |
| `/auth/register` | `register/page.tsx` | Create account (buyer/seller) | Input, Label, Button, Card, Select, Form |
| `/auth/forgot-password` | `forgot-password/page.tsx` | Password reset request | Input, Label, Button, Card |
| `/auth/reset-password` | `reset-password/page.tsx` | Password reset form | Input, Label, Button, Card |
| `/auth/callback` | `callback/route.ts` | Supabase auth callback (API route) | — |

## API Routes (Internal / Platform)

Located under `app/internal/platform/`. These are Next.js Route Handlers for internal monitoring and infrastructure.

| Route | File | Purpose |
|---|---|---|
| `/internal/platform/health` | `health/route.ts` | Health check endpoint |
| `/internal/platform/readiness` | `readiness/route.ts` | Readiness probe |
| `/internal/platform/diagnostics` | `diagnostics/route.ts` | System diagnostics |
| `/internal/platform/cache` | `cache/route.ts` | Cache management |
| `/internal/platform/storage` | `storage/route.ts` | Storage operations |
| `/internal/platform/jobs` | `jobs/route.ts` | Background job triggers |
| `/internal/platform/retry` | `retry/route.ts` | Retry failed operations |
| `/internal/platform/maintenance` | `maintenance/route.ts` | Maintenance mode toggle |
| `/internal/platform/feature-flags` | `feature-flags/route.ts` | Feature flag CRUD |

## Special Routes

| Route | File | Description |
|---|---|---|
| `/not-found` | `not-found.tsx` | 404 page — "Page not found" with "Go home" and "Browse categories" CTAs |
| `/error` | `error.tsx` | Global error boundary — shows error UI with "Try again" button, logs to console |
| `/loading` | `loading.tsx` | Root loading state — renders `<Loading variant="full" />` |
| `/offline` | `offline/page.tsx` | Offline fallback — "You're offline" message with "Try again" CTA, served by SW |
| `/manifest.json` | `manifest.ts` | Dynamic PWA manifest (generated, GET route) |
