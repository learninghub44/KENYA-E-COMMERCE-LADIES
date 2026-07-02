# Design System

## CSS Variables & Theming

Theming is implemented via CSS custom properties in `app/globals.css` with a `.dark` class override. The `next-themes` library applies `.dark` based on user/system preference.

### Light Theme (`:root`)

```css
--background: 0 0% 100%;
--foreground: 240 10% 3.9%;
--card: 0 0% 100%;
--card-foreground: 240 10% 3.9%;
--popover: 0 0% 100%;
--popover-foreground: 240 10% 3.9%;
--primary: 346 77% 50%;           /* Rose #e11d48 */
--primary-foreground: 0 0% 100%;
--secondary: 240 4.8% 95.9%;
--secondary-foreground: 240 5.9% 10%;
--muted: 240 4.8% 95.9%;
--muted-foreground: 240 3.8% 46.1%;
--accent: 240 4.8% 95.9%;
--accent-foreground: 240 5.9% 10%;
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 0 0% 98%;
--border: 240 5.9% 90%;
--input: 240 5.9% 90%;
--ring: 346 77% 50%;
--radius: 0.5rem;
--sidebar-background: 0 0% 98%;
--sidebar-foreground: 240 5.3% 26.1%;
--sidebar-border: 220 13% 91%;
--sidebar-accent: 240 4.8% 95.9%;
--sidebar-accent-foreground: 240 5.9% 10%;
```

### Dark Theme (`.dark`)

```css
--background: 240 10% 3.9%;
--foreground: 0 0% 98%;
--primary: 346 77% 50%;           /* Rose persists across themes */
--primary-foreground: 0 0% 100%;
--secondary: 240 3.7% 15.9%;
--secondary-foreground: 0 0% 98%;
--muted: 240 3.7% 15.9%;
--muted-foreground: 240 5% 64.9%;
--accent: 240 3.7% 15.9%;
--accent-foreground: 0 0% 98%;
--destructive: 0 62.8% 30.6%;
--destructive-foreground: 0 0% 98%;
--border: 240 3.7% 15.9%;
--input: 240 3.7% 15.9%;
--ring: 346 77% 50%;
--sidebar-background: 240 5.9% 10%;
--sidebar-foreground: 240 4.8% 95.9%;
--sidebar-border: 240 3.7% 15.9%;
--sidebar-accent: 240 3.7% 15.9%;
--sidebar-accent-foreground: 240 4.8% 95.9%;
```

### Theme Switching

- `ThemeProvider` wraps the app with `attribute="class"`, `defaultTheme="system"`, `enableSystem`
- `ThemeToggle` component in `components/layout/theme-toggle.tsx` lets users switch light/dark/system
- No flash on load — `suppressHydrationWarning` is set on `<html>`

## Color Palette

| Token | Value (Light) | Usage |
|---|---|---|
| `primary` | Rose (#e11d48) | CTAs, links, active states, badges |
| `primary-foreground` | White | Text on primary surfaces |
| `secondary` | Light gray (240 4.8% 95.9%) | Muted actions, chip backgrounds |
| `muted` | Near-white gray | Subtle backgrounds, disabled |
| `muted-foreground` | Medium gray | Secondary text, placeholders |
| `accent` | Light gray | Hover states, highlighted items |
| `destructive` | Red | Delete, errors, sale badges |
| `background` / `foreground` | White / Near-black | Page and text |
| `border` / `input` | Light gray | Borders and form controls |
| `sidebar-*` | Separated tokens | Admin/seller sidebar surfaces |

## Typography

**Font Family:** DM Sans (weights 400, 500, 600, 700)

Loaded via Google Fonts with preconnect hints in the root layout:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

Applied globally via Tailwind `fontFamily`:

```js
sans: ["DM Sans", "system-ui", "sans-serif"]
```

The `tailwindcss-typography` plugin is available for rich text / prose content.

## UI Components (33 Primitives)

Located in `components/ui/`. Built on Radix primitives, styled with CVA + Tailwind.

| Component | File | Description |
|---|---|---|
| Accordion | `accordion.tsx` | Collapsible sections with Radix Accordion |
| AlertDialog | `alert-dialog.tsx` | Confirmation dialogs for destructive actions |
| AspectRatio | `aspect-ratio.tsx` | Maintains aspect ratio for media |
| Avatar | `avatar.tsx` | User avatars with fallback initials |
| Badge | `badge.tsx` | Inline labels (default, secondary, destructive, outline) |
| Breadcrumb | `breadcrumb.tsx` | Navigation breadcrumb trail |
| Button | `button.tsx` | default, destructive, outline, secondary, ghost, link variants |
| Card | `card.tsx` | Card container (Card, CardHeader, CardContent, CardFooter) |
| Checkbox | `checkbox.tsx` | Form checkbox with label support |
| Collapsible | `collapsible.tsx` | Expandable content panels |
| Dialog | `dialog.tsx` | Modal dialogs with overlay |
| Drawer | `drawer.tsx` | Bottom drawer (via vaul) |
| DropdownMenu | `dropdown-menu.tsx` | Context/popup menus |
| HoverCard | `hover-card.tsx` | Preview cards on hover |
| Input | `input.tsx` | Text input field |
| Label | `label.tsx` | Form label element |
| Pagination | `pagination.tsx` | Page navigation control |
| Popover | `popover.tsx` | Floating content panels |
| Progress | `progress.tsx` | Progress bar indicator |
| RadioGroup | `radio-group.tsx` | Radio button group |
| ScrollArea | `scroll-area.tsx` | Custom scrollable container |
| Select | `select.tsx` | Native-like select dropdown |
| Separator | `separator.tsx` | Horizontal/vertical divider |
| Sheet | `sheet.tsx` | Slide-in panels (mobile nav, etc.) |
| Skeleton | `skeleton.tsx` | Loading placeholder shimmer |
| Slider | `slider.tsx` | Range slider control |
| Switch | `switch.tsx` | Toggle switch |
| Table | `table.tsx` | Data table layout |
| Tabs | `tabs.tsx` | Tabbed content panels |
| Textarea | `textarea.tsx` | Multi-line text input |
| Toggle | `toggle.tsx` | On/off toggle button |
| ToggleGroup | `toggle-group.tsx` | Grouped toggle buttons |
| Tooltip | `tooltip.tsx` | Hover tooltips |

## Shared Components (10 Domain Components)

Located in `components/shared/`.

| Component | File | Description |
|---|---|---|
| `ProductCard` | `product-card.tsx` | Product card with image, badges, name, rating, price |
| `Rating` | `rating.tsx` | Star rating display (sm/md/lg, optional numeric value) |
| `Price` | `price.tsx` | Currency-formatted price (KES), sale/strikethrough variants |
| `Breadcrumbs` | `breadcrumbs.tsx` | Auto-separated breadcrumb navigation |
| `EmptyState` | `empty-state.tsx` | Empty state with icon, title, description, action slot |
| `ErrorState` | `error-state.tsx` | Error state with retry button |
| `Loading` | `loading.tsx` | Loading indicators: full (spinner overlay), inline, skeleton grid |
| `SearchCommand` | `search-command.tsx` | Cmd+K search dialog with category groups |
| `ThemeProvider` | `theme-provider.tsx` | Wraps next-themes ThemeProvider, exports useTheme |
| `Providers` | `providers.tsx` | Root providers: TanStack Query + ThemeProvider + Sonner Toaster |

## Usage Examples

### Button

```tsx
import { Button } from "@/components/ui/button"

<Button>Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="ghost" size="icon"><Search className="h-4 w-4" /></Button>
<Button asChild><Link href="/">Go Home</Link></Button>
```

### Card

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Order Summary</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content here</p>
  </CardContent>
</Card>
```

### Dialog

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader><DialogTitle>Confirm</DialogTitle></DialogHeader>
    <p>Dialog content</p>
  </DialogContent>
</Dialog>
```

### Tabs

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Tabs defaultValue="details">
  <TabsList>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="reviews">Reviews</TabsTrigger>
  </TabsList>
  <TabsContent value="details">...</TabsContent>
  <TabsContent value="reviews">...</TabsContent>
</Tabs>
```

### Form Elements

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

<div className="space-y-4">
  <div>
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="you@example.com" />
  </div>
  <div className="flex items-center gap-2">
    <Checkbox id="terms" />
    <Label htmlFor="terms">Accept terms</Label>
  </div>
  <Select>
    <SelectTrigger><SelectValue placeholder="Size" /></SelectTrigger>
    <SelectContent>
      <SelectItem value="s">Small</SelectItem>
      <SelectItem value="m">Medium</SelectItem>
    </SelectContent>
  </Select>
</div>
```

## Accessibility Notes

- All Radix primitives ship with WAI-ARIA compliance
- Buttons include `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`
- `Dialog` traps focus and closes on Escape
- `Sheet` (mobile nav) traps focus, closes on backdrop click
- All icons use `aria-hidden="true"`
- `Rating` uses `role="img"` with `aria-label`
- `Loading` uses `role="status"` with `aria-label`
- `ErrorState` uses `role="alert"`
- `SearchCommand` uses `role="listbox"` with `role="option"` children and keyboard arrow navigation

See [Accessibility](./accessibility.md) for full coverage.
