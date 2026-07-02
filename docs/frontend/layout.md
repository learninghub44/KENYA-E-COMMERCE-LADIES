# Layout Structure

## Layout Hierarchy

```
RootLayout (app/layout.tsx)
├── Providers (TanStack Query + ThemeProvider + Sonner Toaster)
│   ├── <html lang="en"> with DM Sans font
│   └── <body> with font-sans antialiased
│
├── StorefrontLayout (app/(storefront)/layout.tsx)
│   ├── AnnouncementBar
│   ├── Navbar
│   │   ├── Logo / Home link
│   │   ├── MegaMenu (desktop category navigation)
│   │   ├── SearchBar / SearchTrigger
│   │   ├── ThemeToggle
│   │   ├── AccountDropdown (auth-dependent)
│   │   ├── CartButton
│   │   └── MobileNav (hamburger → Sheet)
│   ├── <main> — children
│   └── Footer
│
├── AdminLayout (app/admin/layout.tsx)
│   ├── Sidebar (desktop: fixed 64-col, mobile: Sheet)
│   │   ├── Logo + "KEC Ladies" branding
│   │   ├── Nav sections: Main, Analytics, Content, Platform, System
│   │   └── Each item: icon + label
│   ├── AdminTopBar
│   │   ├── Search input
│   │   ├── Notifications bell (with badge)
│   │   └── Admin avatar dropdown
│   └── <main> — children
│
└── SellerLayout (app/seller/layout.tsx)
    ├── Sidebar (desktop: fixed 64-col, mobile: Sheet)
    │   ├── "K" logo + "Seller Hub" branding
    │   └── Nav items: Dashboard, Products, Orders, Inventory, Analytics,
    │       Coupons, Messages, Reviews, Store Profile, KYC, Settings
    ├── TopBar
    │   ├── Hamburger (mobile only)
    │   ├── Store name
    │   ├── Notifications bell (with badge)
    │   └── Seller avatar
    └── <main> — children
```

## Root Layout (`app/layout.tsx`)

- **Metadata:** Dynamic title template (`"%s | Kenya E-Commerce Ladies"`), OG/twitter cards, icons, manifest link
- **Viewport:** `width=device-width, initial-scale=1`, theme-color light/dark
- **Font:** DM Sans preconnected and loaded via Google Fonts link in `<head>`
- **Providers wrapper:** `Providers` component (QueryClient + ThemeProvider + Toaster)
- No `data-` attributes other than `suppressHydrationWarning` on `<html>`

## Storefront Layout (`app/(storefront)/layout.tsx`)

A client-rendered layout (no `"use client"` — it's a server component wrapping children). All children are rendered inside a `flex min-h-screen flex-col` container.

### AnnouncementBar (`components/layout/announcement-bar.tsx`)
- Promotional banner at the very top
- Dismissible? (check implementation)

### Navbar (`components/layout/navbar.tsx`)
- Sticky top navigation
- Contains: Logo, MegaMenu, Search, ThemeToggle, Account, Cart
- Adapts to mobile with hamburger → Sheet

### MegaMenu (`components/layout/mega-menu.tsx`)
- Desktop dropdown category navigation
- Triggered on hover/focus of nav items

### MobileNav (`components/layout/mobile-nav.tsx`)
- Sheet-based slide-in navigation for mobile
- Triggered by hamburger icon

### SearchBar / SearchTrigger (`components/layout/search-bar.tsx`, `search-trigger.tsx`)
- `SearchTrigger` opens the `SearchCommand` dialog
- `SearchBar` is an inline search input in the navbar

### AccountDropdown (`components/layout/account-dropdown.tsx`)
- Shows login/register when unauthenticated
- Shows user menu when authenticated (orders, wishlist, profile, sign out)

### CartButton (`components/layout/cart-button.tsx`)
- Cart icon with item count badge
- Links to `/cart` or opens a sheet/drawer

### ThemeToggle (`components/layout/theme-toggle.tsx`)
- Toggles between light/dark/system using next-themes

### Footer (`components/layout/footer.tsx`)
- Full-width footer with links, categories, social, newsletter, copyright

## Admin Layout (`app/admin/layout.tsx`)

- **Sidebar:** Fixed 64-unit width on `lg+`, hidden on smaller screens. Mobile uses a `Sheet` triggered by a floating hamburger button.
- **Sidebar sections:** Main (Dashboard, Users, Sellers, Products, Orders) | Analytics (Analytics, Search Analytics, Business Intelligence) | Content (Moderation, Reviews) | Platform (Health, Diagnostics, Feature Flags) | System (Notifications, Settings)
- **Top bar:** Sticky, with search input, notification bell with badge count, admin avatar dropdown
- **Active state:** Items with `usePathname()` matching get `bg-sidebar-accent text-sidebar-accent-foreground`

## Seller Layout (`app/seller/layout.tsx`)

- **Sidebar:** Fixed 64-unit width on `lg+`, hidden on smaller screens. Mobile uses a `Sheet`.
- **Sidebar items:** Dashboard, Products, Orders, Inventory, Analytics, Coupons, Messages, Reviews, Store Profile, KYC, Settings
- **Top bar:** Sticky with hamburger (mobile), store name, notification bell, avatar
- Uses `aria-[current=page]` for active link styling

## Navigation Components Summary

| Component | Used In | Purpose |
|---|---|---|
| `AnnouncementBar` | Storefront | Top promotional banner |
| `Navbar` | Storefront | Main navigation bar |
| `MegaMenu` | Storefront | Desktop category dropdown |
| `MobileNav` | Storefront | Mobile slide-in navigation |
| `SearchBar` | Storefront | Inline search input |
| `SearchTrigger` | Storefront | Opens search dialog |
| `AccountDropdown` | Storefront | User menu / auth CTAs |
| `CartButton` | Storefront | Cart icon + count |
| `Footer` | Storefront | Site footer |
| `ThemeToggle` | Storefront | Light/dark switch |

## Responsive Breakpoints

Breakpoints follow Tailwind v3 defaults (all `min-width`):

| Breakpoint | Width | Layout Changes |
|---|---|---|
| `sm` | 640px | Two-column grids, horizontal form layouts |
| `md` | 768px | Multi-column grids, header adjustments |
| `lg` | 1024px | Sidebars become visible, mega menu enabled |
| `xl` | 1280px | Wider containers, richer layouts |
| `2xl` | 1400px | Max-width container cap |

Key responsive behaviors:
- **Mobile first** — all layouts start single-column
- **Admin/Seller sidebar** hidden below `lg`, shown as fixed sidebar on `lg+`
- **Mega menu** appears on `lg+`, replaced by hamburger below
- **Product grids** transition: 1 col (`default`) → 2 col (`sm`) → 3 col (`lg`) → 4 col (`xl`)
- **SearchCommand** uses `Cmd+K` keyboard shortcut on all sizes
