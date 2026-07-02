# Zuri Market — Brand Guidelines

**Version:** 1.0
**Owner:** Branding & Public Face (Agent 15A)
**Status:** Approved

---

## 1. Brand Overview

**Project Name:** Zuri Market
**Primary Tagline:** Beautiful Shopping. Trusted Sellers.
**Secondary Tagline:** Kenya's Marketplace for Women.
**Mission:** A trusted, premium multi-vendor marketplace where Kenyan women discover
fashion, beauty, wellness, and lifestyle products from verified sellers.

**Brand Personality**

- **Premium** — polished, high-quality, never cheap or cluttered
- **Modern** — contemporary layouts, generous whitespace, confident typography
- **Elegant** — refined color use, restrained ornamentation
- **Minimal** — every element earns its place; no visual noise
- **Trustworthy** — consistent, professional, safe to build a business on

---

## 2. Logo

### 2.1 Files

| File | Purpose |
|---|---|
| `logo.svg` | Default full-color lockup (icon + wordmark). Use on white/light backgrounds. |
| `logo-dark.svg` | Lockup with light-colored wordmark text. Use on dark-mode UI and dark backgrounds. |
| `logo-white.svg` | Single-color, all-white version. Use over photography, brand-color backgrounds, or anywhere a full-color logo won't have enough contrast. |
| `logo-mark.svg` | Icon only (the "Z" mark), no wordmark. Use for favicons, app icons, avatars, and compact spaces. |
| `icons/` | Pre-rendered PNG icon set at standard PWA/app sizes (48–512px). |
| `social-banner.png` | 1600×900 banner for social sharing and marketing use. |

### 2.2 Clear Space

Maintain clear space around the logo equal to the height of the "Z" mark's
sparkle accent on all sides. Never let text, images, or UI chrome intrude on
this space.

### 2.3 Minimum Size

- Full lockup (`logo.svg`): never smaller than 120px wide in digital contexts.
- Icon mark alone (`logo-mark.svg`): never smaller than 24px wide.

### 2.4 Don'ts

- Don't recolor the mark outside the approved purple/gold gradient or the
  monochrome white version.
- Don't stretch, skew, or distort the logo's proportions.
- Don't add drop shadows, outlines, or effects not specified here.
- Don't place the full-color logo on busy photography — use `logo-white.svg`
  or `logo-dark.svg` instead.
- Don't rearrange the icon and wordmark relative to each other.

---

## 3. Color

See [`brand-colors.md`](./brand-colors.md) for the full palette, hex/RGB
values, gradients, Tailwind config, and accessibility notes.

**Quick reference:**

- Primary Purple `#6A0E7D` — primary brand color
- Deep Amethyst `#2D0A42` — gradients, dark surfaces
- Champagne Gold `#C9973F` — accents, highlights
- Ink `#1A1225` — body text
- Cloud White `#FDFBFB` — page backgrounds

---

## 4. Typography

**Primary Typeface:** DM Sans

- **Headings:** DM Sans, Bold (700) or Medium (500), generous letter-spacing
  for all-caps treatments (wordmark, section labels).
- **Body copy:** DM Sans, Regular (400).
- **UI labels/captions:** DM Sans, Medium (500), smaller sizes with tight
  but legible letter-spacing.

**Fallback stack:** `'DM Sans', 'Helvetica Neue', Arial, sans-serif`

Load DM Sans via Google Fonts or self-hosted `next/font` in production; the
app already preconnects to Google Fonts in `app/layout.tsx`.

---

## 5. Iconography

- Use a single, consistent icon library across the product (the app already
  uses `lucide-react` — continue using it for UI icons).
- Category icons (Fashion, Beauty, Wellness, Lifestyle) follow the circular
  badge treatment shown in the logo lockup: a soft tinted circle background
  (light purple or cream) with a simple line icon in brand purple or gold.
- Icons should be simple, single-weight line icons — no gradients or
  photographic icons in the UI.

---

## 6. Spacing & Layout

- Base spacing unit: **4px**, scaling in multiples of 4 (Tailwind's default
  spacing scale).
- Cards and containers use generous padding (minimum 16px, 24–32px for
  primary content cards) to preserve the "premium, minimal" feel.
- Avoid dense, cluttered grids. Prefer fewer items with more breathing room
  over cramming content in.

---

## 7. Tone of Voice

- **Warm but professional.** Speak to the user like a trusted friend who
  happens to run a great shop — not a corporate FAQ page.
- **Empowering.** Copy should reflect the "Discover. Shop. Empower." ethos —
  celebrate sellers building businesses and buyers finding what they love.
- **Clear over clever.** Prioritize clarity in transactional copy (checkout,
  errors, confirmations). Save personality for marketing surfaces.
- **Locally grounded.** Reference Kenyan context naturally (KES pricing,
  M-Pesa, local delivery) without over-explaining it.
- Avoid slang that dates quickly, avoid exclamation-point overload, and never
  use fear-based urgency tactics ("Only 1 left!!") — trust is a core brand
  value.

---

## 8. Photography

- Favor natural light, real people, and authentic Kenyan settings over
  overly staged studio photography.
- Product photography: clean, neutral or brand-tinted backgrounds, consistent
  crop ratios per category.
- Lifestyle photography: warm, candid, diverse representation of Kenyan
  women across ages and styles.
- Avoid stock photography that feels generic or non-representative of the
  target market.

---

## 9. Marketing Usage

- Use `og-image.png` (1200×630) for link previews (Open Graph/Twitter cards).
- Use `social-banner.png` (1600×900) for social posts and paid marketing
  creative — brand purple gradient background, white icon mark, wordmark in
  white/gold.
- Always maintain minimum clear space and never overlay marketing copy
  directly on top of the icon mark.
- Co-branding with sellers/partners: Zuri Market logo stays visually
  dominant; partner logos are sized no larger than the Zuri Market mark.

---

## 10. File Index

```
branding/
├── logo.svg                  # Default full-color lockup
├── logo-dark.svg              # Lockup for dark backgrounds
├── logo-white.svg             # Monochrome white lockup
├── logo-mark.svg               # Icon only
├── social-banner.png           # 1600×900 marketing banner
├── brand-colors.md             # Full color palette & usage
├── brand-guidelines.pdf        # This document, as a shareable PDF
└── icons/                      # PNG icon set, 48–512px
```
