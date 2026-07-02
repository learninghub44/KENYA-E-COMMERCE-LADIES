# Accessibility

## Target

**WCAG 2.2 AA** compliance across all public and authenticated pages.

## Current Implementation

### Semantic HTML

- Native `<nav>`, `<main>`, `<header>`, `<footer>`, `<aside>` elements used in layouts
- Heading hierarchy (`h1` → `h6`) preserved on each page
- `<form>` elements use proper `action` / `onSubmit` handling
- `<label>` elements linked to inputs via `htmlFor`/`id` pairs

### ARIA Labels

- All decorative icons use `aria-hidden="true"`
- `Rating` component: `role="img"` with `aria-label="{value} out of {max} stars"`
- `Loading` component: `role="status"` with `aria-label="Loading"`
- `ErrorState` component: `role="alert"`
- `EmptyState` component: `role="status"`
- `SearchCommand`: `role="listbox"` with `role="option"` children, `aria-selected` on active item
- Navbar buttons: `aria-label` on icon-only buttons (e.g. `aria-label="Notifications"`, `aria-label="Open search"`)
- Newsletters form: `aria-label="Newsletter subscription"` on `<form>`, `aria-required="true"` on email input, `<label>` with `sr-only` class
- Mobile nav hamburger: `sr-only` span "Toggle navigation menu"

### Keyboard Navigation

- All Radix UI primitives support full keyboard interaction out of the box:
  - `Dialog` — focus trap, Escape to close, Enter/Space to confirm
  - `DropdownMenu` — arrow keys, Enter/Space to select, Escape to close
  - `Tabs` — arrow keys to switch tabs
  - `Accordion` — Enter/Space to toggle, Home/End navigation
  - `Select` — arrow keys, typeahead
  - `Sheet` — focus trap, Escape to close
- `SearchCommand`: `Cmd+K` / `Ctrl+K` to open, arrow keys to navigate results, Enter to select
- All focusable elements have visible focus indicators

### Focus Management

- Global focus ring via Tailwind: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Link focus states: `focus-visible:ring` on all anchor elements
- Button focus styles defined in CVA variants (included in `buttonVariants`)
- `Sheet` and `Dialog` trap focus within the overlay
- `SearchCommand` auto-focuses input when dialog opens

### Color Contrast

- Light theme background/text: `#ffffff` on `hsl(240 10% 3.9%)` — ratio ~19:1
- Muted text: `hsl(240 3.8% 46.1%)` on white — ratio ~4.5:1 (meets AA)
- Primary (rose) on white: `#e11d48` on `#ffffff` — ratio ~4.8:1 (meets AA)
- Primary (rose) on dark background: `#e11d48` on `hsl(240 10% 3.9%)` — ratio ~6.2:1 (meets AA)
- Destructive (red) on white: `hsl(0 84.2% 60.2%)` on `#ffffff` — ratio ~4:1 (meets AA for large text)
- Dark theme surfaces use adequate contrast ratios per Tailwind shadcn/ui defaults

## Areas Needing Improvement

| Area | Issue | Priority |
|---|---|---|
| **Skip navigation link** | No skip-to-content link at the top of pages | High |
| **Form error announcements** | Forms use Zod validation but errors are not explicitly announced by screen readers | High |
| **Live regions** | Cart count updates, toast notifications not using `aria-live` | High |
| **Focus on route change** | Page changes don't reset focus to top of `<main>` | Medium |
| **Image alt text** | Product images rely on dynamic `alt` from data — needs verification for all image components | Medium |
| **Color contrast (destructive)** | Destructive color on dark backgrounds could be borderline | Medium |
| **Touch targets** | Small icon buttons (32×32) may not meet 44×44px minimum on mobile | Low |
| **Reduced motion** | Framer Motion animations don't respect `prefers-reduced-motion` | Low |
| **Screen reader announcements** | Loading states, content updates, and page transitions lack ARIA live region announcements | Low |
| **PDF/documents** | No accessible document handling | Low |

## Testing Approach

### Automated

| Tool | Usage |
|---|---|
| **eslint-plugin-jsx-a11y** | Integrated via ESLint config — catches missing alt text, incorrect ARIA, missing labels |
| **axe-core / Playwright** | Future: add axe checks to Playwright tests for each route |
| **Tailwind a11y plugin** | Not currently used — consider adding for contrast validation |
| **Storybook a11y addon** | Future: if Storybook is added, include the a11y addon |

### Manual

- **Screen reader testing** with NVDA (Windows) and VoiceOver (macOS)
- **Keyboard-only navigation** — tab through all interactive elements on every route
- **Zoom testing** — 200% zoom and 400% zoom on all pages
- **Color contrast check** using the WebAIM Contrast Checker on all foreground/background pairs
- **Reduced motion testing** — enable `prefers-reduced-motion` in OS settings and verify animations disable

### Future CI Pipeline

```yaml
# Proposed GitHub Action step
- name: Accessibility audit
  run: npx axe-core http://localhost:3000 --dir ./a11y-reports
- name: Lighthouse CI
  run: npx lhci autorun
```

## Accessibility Checklist for New Features

- [ ] All images have meaningful `alt` text (or `aria-hidden="true"` + `role="presentation"` for decorative)
- [ ] All form inputs have associated `<label>` elements
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for large text)
- [ ] Interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] ARIA roles/labels are used where semantic HTML is insufficient
- [ ] Motion/animation respects `prefers-reduced-motion`
- [ ] Error messages are associated with inputs via `aria-describedby`
- [ ] Touch targets are at least 44×44px
