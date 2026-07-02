# Performance Strategy

## Targets

- **Lighthouse Performance Score**: > 90
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Interaction to Next Paint (INP)**: < 200ms
- **First Input Delay (FID)**: < 100ms

## Optimizations Implemented

### Images

| Optimization | Implementation |
|-------------|---------------|
| Next.js Image component | Automatic srcset generation, lazy loading, responsive sizes |
| Remote patterns | Cloudinary, Google, GitHub allowed |
| Formats | AVIF + WebP via `formats: ["image/avif", "image/webp"]` |
| Device sizes | 640-2048px for responsive breakpoints |
| Image sizes | 16-384px for thumbnails |
| Lazy loading | Default `loading="lazy"` for below-fold images |
| Priority | `priority` attribute on hero/LCP images |

### Code Splitting

| Optimization | Implementation |
|-------------|---------------|
| Package imports | `optimizePackageImports` for lucide-react, framer-motion, recharts, radix icons, sonner, vaul |
| Dynamic imports | Route-based code splitting via Next.js App Router |
| Tree shaking | ES module imports, only used icons/components bundled |
| Webpack build worker | `experimental.webpackBuildWorker: true` for faster builds |

### Caching

| Layer | Strategy |
|-------|----------|
| Static assets (CSS/JS/fonts) | Cache-first via service worker |
| Images | Cache-first via service worker with IMAGE_CACHE |
| API responses | Stale-while-revalidate via service worker |
| Navigation pages | Network-first via service worker with offline fallback |
| React Query | 60s staleTime, refetchOnWindowFocus disabled |

### Rendering

- All pages currently use `'use client'` — next phase can convert to server components
- Suspense boundaries for async content loading
- Streaming via Next.js `loading.tsx` per route

### Fonts

| Optimization | Implementation |
|-------------|---------------|
| Preconnect | `rel="preconnect"` to Google Fonts origins |
| Font display | `display=swap` (default for Google Fonts URL) |
| Font subsetting | DM Sans loaded with specific weights only (400,500,600,700) |
| System font fallback | `sans: ["DM Sans", "system-ui", "sans-serif"]` |

### Bundle Size

- Console removal in production: `removeConsole: { exclude: ["error", "warn"] }`
- `poweredByHeader: false`
- `compress: true` (gzip/brotli)
- `reactStrictMode: true` for development warnings

### Monitoring

- Web Vitals reporting via Next.js `reportWebVitals` (future)
- TanStack Query Devtools in development (future)

## Recommendations for Future

1. **Server Components**: Convert data-fetching pages to RSC with client islands
2. **Partial Prerendering**: Use Next.js PPR for hybrid static/dynamic pages
3. **Bundle Analysis**: Run `@next/bundle-analyzer` to identify large imports
4. **Image CDN**: Serve all product images through Cloudinary with transformations
5. **Edge Caching**: Add CDN caching rules for product and category pages
6. **Critical CSS**: Inline above-fold CSS for first paint
7. **Script Loading**: Defer third-party scripts (analytics, chat widgets)
