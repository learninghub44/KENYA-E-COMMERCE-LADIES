# Zuri Market — Brand Colors

Colors are sampled directly from the approved logo artwork. Use these values in
Tailwind config, CSS variables, and design tools so every surface stays on-brand.

## Primary Palette

| Swatch | Name | Hex | RGB | Usage |
|---|---|---|---|---|
| 🟪 | Royal Amethyst (Primary Purple) | `#6A0E7D` | `106, 14, 125` | Primary brand color, wordmark, buttons, links |
| 🟪 | Deep Amethyst | `#2D0A42` | `45, 10, 66` | Gradients, dark backgrounds, hero sections |
| 🟨 | Champagne Gold (Primary Gold) | `#C9973F` | `201, 151, 63` | Accent color, "MARKET" wordmark, highlights, CTAs on dark |
| 🟨 | Light Gold | `#E4BE7E` | `228, 190, 126` | Gold on dark backgrounds, hover states, secondary accents |

## Neutrals

| Swatch | Name | Hex | RGB | Usage |
|---|---|---|---|---|
| ⬛ | Ink | `#1A1225` | `26, 18, 37` | Body text on light backgrounds |
| ⬜ | Cloud White | `#FDFBFB` | `253, 251, 251` | Page backgrounds, cards |
| ◽ | Mist Gray | `#6B5A73` | `107, 90, 115` | Secondary text, taglines, captions |

## Gradients

- **Brand Gradient (Purple):** `linear-gradient(135deg, #2D0A42 0%, #6A0E7D 100%)` — used on the "Z" mark, hero banners, and primary CTA backgrounds.
- **Gold Accent Gradient:** `linear-gradient(135deg, #C9973F 0%, #E4BE7E 100%)` — used sparingly for premium accents (badges, seller-verified marks, premium tier UI).

## Tailwind Config Reference

```ts
// tailwind.config.ts
colors: {
  brand: {
    purple: {
      DEFAULT: "#6A0E7D",
      dark: "#2D0A42",
    },
    gold: {
      DEFAULT: "#C9973F",
      light: "#E4BE7E",
    },
    ink: "#1A1225",
    cloud: "#FDFBFB",
    mist: "#6B5A73",
  },
}
```

## Accessibility Notes

- `#6A0E7D` on `#FDFBFB` passes WCAG AA for normal text (contrast ratio ≈ 8.9:1).
- `#C9973F` on `#2D0A42` passes WCAG AA for large text/UI components (contrast ratio ≈ 4.7:1); use `#E4BE7E` for small body text on dark backgrounds instead.
- Never place `#C9973F` gold text on white — contrast is insufficient for body copy. Reserve gold-on-white for large display type only.
