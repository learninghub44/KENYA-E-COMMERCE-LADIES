# PWA Enhancements

## Overview

The marketplace is fully configured as a Progressive Web App with offline support, install prompt, and background update notifications.

## Current Implementation

### Service Worker (`public/sw.js` — v2)

Caching strategies:

| Strategy | Scope | Cache Name |
|----------|-------|------------|
| **Network-first** | Navigation requests (HTML pages) | `kec-ladies-static-v2` |
| **Cache-first** | Static assets (CSS, JS, fonts) | `kec-ladies-static-v2` |
| **Cache-first** | Images | `kec-ladies-images-v2` |
| **Stale-while-revalidate** | API responses | `kec-ladies-api-v2` |

Lifecycle:
- `install`: Pre-caches static assets, calls `skipWaiting()` immediately
- `activate`: Cleans old caches, claims clients
- `message`: Handles `SKIP_WAITING` for seamless updates
- `fetch`: Routes requests to appropriate strategy based on type

### Install Prompt

Implemented via `useServiceWorker` hook + `PwaInstallPrompt` component:

1. Listens for `beforeinstallprompt` event
2. Stores deferred prompt
3. Shows install banner at bottom of screen
4. On "Install" click, calls `prompt()` on deferred event
5. Dismisses on "Not now" or `X` button
6. Detects installed state via `display-mode: standalone`

### Update Notification

- Detects when service worker finds new version (`updatefound` event)
- Shows `PwaUpdateNotification` banner
- User clicks "Update" which sends `SKIP_WAITING` message
- New service worker takes control, page reloads

### Offline Page (`/offline`)

- Manually accessible or served automatically by SW on network failure
- Shows "You're offline" message with retry button
- Styled consistently with the app design language

## Usage

Service worker is registered automatically in `useServiceWorker` hook (called by `PwaInstallPrompt` and `PwaUpdateNotification` which are included in `Providers`).

No manual registration needed.

## Pending Improvements

1. **Background Sync**: Register sync events for cart mutations, order submissions
2. **Push Notifications**: Subscribe to push API for order updates
3. **Screenshots**: Add screenshot array to manifest for Play Store listing
4. **Runtime Caching**: Fine-tune cache durations per API endpoint
5. **Precaching**: Cache critical product images on install
6. **Periodic Sync**: Update product data in background
7. **Share Target**: Register as share target for product links
