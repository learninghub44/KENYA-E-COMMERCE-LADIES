# SEO Architecture

## Metadata Strategy

### Global (Root Layout)
- Default title template: `"%s | Kenya E-Commerce Ladies"`
- Default description
- Open Graph + Twitter Cards configuration
- Canonical URL via `metadataBase`
- Icons and manifest references

### Per-Page
Dynamic metadata generated via `lib/seo.ts` `generateMetadata()`:

```ts
export const metadata = generateMetadata({
  title: "Search Results",
  description: "Browse thousands of products...",
  path: "/search",
})
```

## Structured Data (JSON-LD)

Implemented with `<JsonLd>` component and schema generators in `lib/seo.ts`:

| Schema | Placement | Purpose |
|--------|-----------|---------|
| `Organization` | Root layout | Brand identity, contact info, social profiles |
| `WebSite` | Root layout | Site name, search action for Sitelinks Search Box |
| `Product` | Product detail page | Name, description, image, price, availability, brand, aggregate rating |
| `BreadcrumbList` | Category/product pages | Navigation breadcrumb for rich results |
| `SearchAction` | Part of WebSite schema | Powers Google Sitelinks Search Box |

### Usage

```tsx
import { JsonLd } from "@/components/shared/json-ld"
import { productJsonLd, breadcrumbJsonLd } from "@/lib/seo"

<JsonLd data={productJsonLd({ ... })} />
<JsonLd data={breadcrumbJsonLd([...])} />
```

## Technical SEO

| Feature | Implementation |
|---------|---------------|
| **Sitemap** | `app/sitemap.ts` — dynamic sitemap.xml with static routes + category routes |
| **Robots** | `app/robots.ts` — disallows /admin/, /seller/, /auth/, /api/internal/, /offline |
| **Canonical URLs** | Set per-page via `alternates.canonical` in metadata |
| **Meta robots** | `noindex` on admin/seller/auth pages |
| **Open Graph** | title, description, url, site_name, locale (en_KE), images (1200x630) |
| **Twitter Cards** | summary_large_image with title, description, image |
| **Pagination** | rel=next/prev links on search/category pages |

## Performance Signals

- Core Web Vitals optimized (see performance-strategy.md)
- Images optimized via next/image with WebP/AVIF
- Font preconnect and preload
- Critical CSS inlined (Tailwind)

## Social Sharing

Pages with Open Graph images use a 1200x630 default OG image at `/og-default.png`.
