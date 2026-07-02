# Accessibility Compliance

## Target: WCAG 2.2 AA

All public and authenticated pages meet WCAG 2.2 AA standards.

## Implemented Patterns

### Perceivable

| Criterion | Implementation |
|-----------|---------------|
| **1.1.1 Non-text Content** | All images have meaningful `alt` or `aria-hidden="true"` + `role="presentation"`. Icons use `aria-hidden="true"`. |
| **1.2.x Time-based Media** | N/A — no video/audio content |
| **1.3.1 Info and Relationships** | Semantic HTML (`<nav>`, `<main>`, `<header>`, `<footer>`, `<aside>`). Proper heading hierarchy (h1→h6). Form inputs use `<label>` with `htmlFor`. |
| **1.3.2 Meaningful Sequence** | Content order matches visual order. CSS Grid/Flexbox does not change DOM order. |
| **1.3.3 Sensory Characteristics** | Instructions never rely solely on shape/size/position/location/sound. |
| **1.4.1 Use of Color** | Color never sole differentiator. Links underlined on hover. Error states show icon + text. |
| **1.4.3 Contrast (Minimum)** | All text meets 4.5:1 ratio. Large text (18px+ bold / 24px+ regular) meets 3:1. |
| **1.4.4 Resize Text** | No loss of content or functionality at 200% zoom. |
| **1.4.5 Images of Text** | Text is text, not images. |
| **1.4.10 Reflow** | Content displays without loss at 400% zoom (1280px CSS width). Mobile nav converts to hamburger. |
| **1.4.11 Non-text Contrast** | UI components and graphical objects meet 3:1 against adjacent colors. |
| **1.4.12 Text Spacing** | No loss of content when text spacing is overridden. |
| **1.4.13 Content on Hover or Focus** | Tooltips and hover cards dismissable via Escape. |

### Operable

| Criterion | Implementation |
|-----------|---------------|
| **2.1.1 Keyboard** | All interactive elements accessible via keyboard. Radix primitives handle complex keyboard interaction. |
| **2.1.2 No Keyboard Trap** | Focus never trapped. All modals/dialogs closeable via Escape. |
| **2.2.x Enough Time** | No time limits on actions. Session timeout handled gracefully. |
| **2.3.x Seizures** | No flashing content. Animations respect `prefers-reduced-motion`. |
| **2.4.1 Bypass Blocks** | `SkipNav` component — skip-to-content link appears on first Tab press. |
| **2.4.2 Page Titled** | Every page has unique, descriptive `<title>` via Next.js metadata. |
| **2.4.3 Focus Order** | Logical focus order matching visual layout. |
| **2.4.4 Link Purpose (In Context)** | All links have descriptive text. Icon-only links have `aria-label`. |
| **2.4.5 Multiple Ways** | Site-wide search + navigation + breadcrumbs. |
| **2.4.6 Headings and Labels** | Descriptive headings and form labels throughout. |
| **2.4.7 Focus Visible** | `focus-visible:ring-2 focus-visible:ring-ring` on all interactive elements. |
| **2.4.11 Focus Not Obscured** | Focused elements not hidden by sticky headers. |
| **2.5.x Pointer / Motion** | Touch targets minimum 44x44px. No motion-activated interactions. |

### Understandable

| Criterion | Implementation |
|-----------|---------------|
| **3.1.1 Language of Page** | `<html lang="en">` set in root layout. |
| **3.2.1 On Focus** | No context changes on focus. |
| **3.2.2 On Input** | No context changes on input unless warned. |
| **3.3.1 Error Identification** | Form errors identified by `aria-describedby` on inputs + visible error text below field. |
| **3.3.2 Labels or Instructions** | All form fields have visible labels. Required fields marked with `*`. |
| **3.3.3 Error Suggestion** | Zod validation provides specific error messages (e.g., "Email must be valid"). |
| **3.3.4 Error Prevention (Legal, Financial, Data)** | Checkout requires explicit confirmation before submission. |
| **3.3.7 Accessible Authentication** | No cognitive function tests (no CAPTCHA, no password memorization for auth). |

### Robust

| Criterion | Implementation |
|-----------|---------------|
| **4.1.1 Parsing** | Valid HTML, properly nested elements. |
| **4.1.2 Name, Role, Value** | Custom components (Radix) have proper ARIA roles and states. |
| **4.1.3 Status Messages** | `aria-live="polite"` on toast notifications, form status, loading states. |

## Components

| Component | A11y Features |
|-----------|--------------|
| `SkipNav` | First Tab target, slides into view, links to `#main-content` |
| `FocusTarget` | `tabIndex={-1}`, receives focus on route change, scrolls to top |
| `LiveRegion` | `aria-live="polite"`, `aria-atomic="true"`, screen reader announcements |
| `FormStatus` | `role="alert"`, `aria-live="polite"` |
| `DirtyIndicator` | `aria-live="polite"` announces unsaved changes |
| `Loading` | `role="status"`, `aria-label`, `sr-only` text |
| `ErrorState` | `role="alert"` |
| `EmptyState` | `role="status"` |
| `Rating` | `role="img"`, `aria-label="{value} out of {max} stars"` |
| `SearchCommand` | `role="listbox"`, `role="option"`, `aria-selected`, Cmd+K trigger |
| `Sheet` (mobile nav) | Focus trap, Escape to close, `aria-label` |

## Testing

- **Automated**: ESLint `jsx-a11y` plugin catches common issues
- **Manual**: Keyboard-only navigation, NVDA/VoiceOver screen reader testing
- **Axe DevTools**: Browser extension audit for WCAG compliance
