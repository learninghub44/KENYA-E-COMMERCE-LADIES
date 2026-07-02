# Progressive Web App (PWA)

## Overview

The marketplace is configured as a PWA with offline support. The manifest is dynamically generated via `app/manifest.ts` and the service worker is at `public/sw.js`.

## Manifest Configuration

Defined in `app/manifest.ts` — a Next.js `MetadataRoute.Manifest` export available at `/manifest.json`:

```json
{
  "name": "Kenya E-Commerce Ladies",
  "short_name": "KEC Ladies",
  "description": "Africa's premier multi-vendor marketplace for women's fashion, beauty, skincare, wellness, accessories, and lifestyle products.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#e11d48",
  "orientation": "portrait-primary",
  "categories": ["shopping", "fashion", "lifestyle"],
  "icons": [
    { "src": "/icons/icon-48.png", "sizes": "48x48", "type": "image/png" },
    { "src": "/icons/icon-72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/icons/icon-96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/icons/icon-128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": []
}
```

The manifest is referenced in the root layout metadata:

```ts
manifest: "/manifest.json",
```

## Service Worker (`public/sw.js`)

A static service worker with cache-first strategy:

- **Cache name:** `kec-ladies-v1`
- **Pre-cached on install:** `/`, `/offline`, `/manifest.json`
- **Fetch strategy:** Cache-first with network fallback. On success, responses are cloned and stored in cache. On network failure, falls back to `/offline` page.
- **Activation:** Clears old cache versions.

```js
const CACHE_NAME = "kec-ladies-v1";
const STATIC_ASSETS = ["/", "/offline", "/manifest.json"];
```

### Service Worker Registration

Registration is not yet implemented in the client code. Future implementation should add registration in `components/shared/providers.tsx` or a dedicated hook:

```ts
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}
```

## Offline Page (`app/offline/page.tsx`)

A static page served when the network is unavailable. Displays:

- `WifiOff` icon in a muted circle
- "You're offline" heading
- Explanation message
- "Try again" button linking to `/`

## Icon Requirements

Located in `public/icons/`. Nine sizes covering all PWA requirements:

| Size | File | Purpose |
|---|---|---|
| 48×48 | `icon-48.png` | Small icons |
| 72×72 | `icon-72.png` | Chrome (Android) |
| 96×96 | `icon-96.png` | Chrome (Android) |
| 128×128 | `icon-128.png` | Chrome (Android) |
| 144×144 | `icon-144.png` | MS Tile |
| 152×152 | `icon-152.png` | iOS Safari |
| 192×192 | `icon-192.png` | Chrome install prompt, maskable |
| 384×384 | `icon-384.png` | Chrome (Android) |
| 512×512 | `icon-512.png` | App icon, maskable |

Icons should be PNG format with transparent backgrounds where appropriate, using the rose brand color (#e11d48) as the primary accent.

## Install Prompt (Future)

The install prompt is not yet implemented. Planned approach:

```ts
let deferredPrompt: BeforeInstallPromptEvent | null = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show custom install UI
});

// On install button click:
deferredPrompt?.prompt();
deferredPrompt = null;
```

## Background Sync Hooks (Placeholder)

No background sync hooks are implemented yet. Standard patterns to add later:

```ts
// Register sync
navigator.serviceWorker.ready.then((reg) => {
  reg.sync.register("sync-orders");
});

// In sw.js:
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-orders") {
    event.waitUntil(syncOrders());
  }
});
```

## Pending PWA Improvements

1. Service worker registration in client entry
2. Install prompt UI component
3. Background sync for order/cart mutations
4. Push notification subscription
5. Screenshots array in manifest
6. Precaching more static assets (CSS, JS bundles, images)
7. Runtime caching strategy for API responses
