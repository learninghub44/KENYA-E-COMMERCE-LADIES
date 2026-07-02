# Frontend Security

## Implemented Measures

### Content Security Policy (CSP)

Ready via `lib/security.ts` `buildCspHeader()`. Current directives:

| Directive | Sources |
|-----------|---------|
| `default-src` | `'self'` |
| `script-src` | `'self'`, `'unsafe-eval'`, `'unsafe-inline'`, Google Tag Manager |
| `style-src` | `'self'`, `'unsafe-inline'`, Google Fonts |
| `img-src` | `'self'`, `data:`, `blob:`, Cloudinary, Google, GitHub |
| `font-src` | `'self'`, Google Fonts (gstatic) |
| `connect-src` | `'self'`, Supabase |
| `frame-src` | `'none'` |
| `object-src` | `'none'` |
| `base-uri` | `'self'` |
| `form-action` | `'self'` |

### Security Headers

Set in `next.config.ts` via `async headers()`:

| Header | Value |
|--------|-------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-DNS-Prefetch-Control` | `on` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` |

### Input Sanitization (`lib/security.ts`)

| Function | Purpose |
|----------|---------|
| `sanitizeInput(value)` | Escapes HTML entities in user input |
| `sanitizeUrl(url)` | Allows only http/https/mailto/tel protocols, rejects javascript: |
| `sanitizeFileName(filename)` | Removes dangerous characters from filenames |
| `stripHtml(html)` | Strips all HTML tags from string |
| `isValidFileType(mime, allowed)` | Validates MIME type against allowed list |

### XSS Prevention

- React's built-in JSX escaping handles most XSS vectors
- `dangerouslySetInnerHTML` used only in `JsonLd` component (controlled JSON input)
- All user-generated content rendered through React's text node handling
- `sanitizeInput()` for any raw string interpolation

### Form Security

- All forms validated client-side with Zod schemas
- CSRF protection handled server-side (integration hooks ready)
- File uploads validated for type and sanitized filenames
- Form submissions use POST method

### Additional Measures

| Measure | Status |
|---------|--------|
| `poweredByHeader: false` | Hides Next.js version from attackers |
| `reactStrictMode: true` | Catches unsafe lifecycle patterns |
| No inline scripts | All JS bundled by Next.js |
| No eval() | `'unsafe-eval'` required for Next.js dev; production eliminates it |
| HTTPS enforced | HSTS header + production redirect |

## Recommendations for Production

1. Enable CSP reporting endpoint (`report-uri` / `report-to`)
2. Add nonce-based script CSP for stricter policy
3. Implement Subresource Integrity (SRI) for external scripts
4. Add bot detection and rate limiting on client
5. Regular dependency audits (`pnpm audit`)
6. Environment variable validation at build time
