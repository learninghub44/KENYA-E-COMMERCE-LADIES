# Internationalization Readiness

## Overview

The application is prepared for internationalization (i18n) but does not yet have translations loaded.

## Implemented Infrastructure

### Locale Types (`lib/i18n.ts`)

```ts
type Locale = "en-KE" | "sw-KE"
```

Supports English (Kenya) and Kiswahili (Kenya) out of the box. Extensible to additional locales.

### Formatting Functions

All formatting uses native `Intl` APIs:

| Function | Purpose | Example |
|----------|---------|---------|
| `formatCurrency(amount, locale, currency)` | Price formatting | `formatCurrency(2450, "en-KE", "KES")` → "KES 2,450.00" |
| `formatDate(date, locale, options)` | Date formatting | `formatDate(...)` → "Jan 15, 2026" |
| `formatRelativeTime(date, locale)` | Relative time | "2 hours ago", "just now" |
| `formatNumber(num, locale)` | Number formatting | `formatNumber(12345)` → "12,345" |

### Translation Interface

```ts
const t = createTranslator({
  "product.add_to_cart": "Add to Cart",
  "cart.total": "Total: {amount}",
})

t("product.add_to_cart") // "Add to Cart"
t("cart.total", { amount: formatCurrency(2450) }) // "Total: KES 2,450.00"
```

### RTL Readiness

- `getLocaleDir(locale)` returns `"ltr"` or `"rtl"` per locale
- CSS logical properties used where possible (`margin-inline-start` etc.)
- `<html>` `dir` attribute would be set dynamically based on locale

## Future Integration

### Next.js i18n Routing

```ts
// middleware.ts (future)
import { match } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"

const locales = ["en-KE", "sw-KE"]
const defaultLocale = "en-KE"

function getLocale(request: Request): string {
  const headers = { "accept-language": request.headers.get("accept-language") ?? "" }
  const languages = new Negotiator({ headers }).languages()
  return match(languages, locales, defaultLocale)
}
```

### Translation Files

Expected structure:
```
messages/
├── en-KE.json
└── sw-KE.json
```

### Locale Detection

Priority:
1. URL path prefix (`/sw-KE/products/...`)
2. Cookie (`NEXT_LOCALE`)
3. Accept-Language header
4. Default to `en-KE`

### Date/Currency overrides

Users can override locale preferences in account settings, independent of browser/URL locale.

## Usage in Components

```tsx
// Current (hardcoded):
<p>KES 2,450.00</p>

// Future with i18n:
<p>{t("cart.total", { amount: formatCurrency(2450) })}</p>
```
