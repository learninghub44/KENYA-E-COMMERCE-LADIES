# UX Guidelines

## Design Principles

- **Minimal & Premium**: Clean layouts with generous whitespace. No clutter.
- **Fast Interactions**: Sub-100ms feedback on all user actions.
- **Subtle Animations**: Motion should feel natural, not distracting.
- **Consistent**: Every page follows the same patterns for navigation, forms, loading, and error handling.

## Loading States

Every user action must show immediate feedback. Implemented via:

| State | Component | Usage |
|-------|-----------|-------|
| Initial page load | Route-specific `loading.tsx` | Skeleton matching page layout |
| Data fetch | `Loading` with `variant="inline"` | Inline spinner for partial updates |
| Product grid | `Loading` with `variant="product-grid"` | 8-card skeleton grid |
| Table data | `Loading` with `variant="table"` | Row skeletons matching column count |
| Form submission | `SubmitButton` with loading state | Button spinner, disabled during submit |
| Page transition | `PageTransition` component | Fade+slide animation (respects reduced motion) |
| Infinite scroll | Inline spinner at scroll end | Minimal spinner + "Loading more..." text |

## Error States

| State | Component | Recovery |
|-------|-----------|----------|
| Network error | `ErrorState` | Retry button |
| Permission denied | `ErrorState` with lock icon | "Go back" link |
| 404 | `not-found.tsx` (route-specific) | Home link + search |
| 500 | Route-specific `error.tsx` | Try again + home link |
| Offline | PWA offline page | "Try again" + retry logic |
| Form validation | `FormField` error prop | Inline error message below field |
| API failure | `ErrorState` | Retry via TanStack Query |

## Optimistic UI

Pattern for instant feedback on mutations:

```tsx
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: updateItem,
  onMutate: async (newItem) => {
    await queryClient.cancelQueries({ queryKey: ["items"] })
    const previous = queryClient.getQueryData(["items"])
    queryClient.setQueryData(["items"], (old) => optimisticUpdate(old, newItem))
    return { previous }
  },
  onError: (err, newItem, context) => {
    queryClient.setQueryData(["items"], context?.previous)
    toast.error("Failed to update")
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] })
  },
})
```

## Forms

| Feature | Implementation |
|---------|---------------|
| Validation | Zod schemas with react-hook-form resolvers |
| Dirty state | `DirtyIndicator` component shows unsaved changes |
| Autosave | Debounced mutation on form field changes |
| Loading button | `SubmitButton` with spinner and disabled state |
| Success state | `FormStatus` with checkmark + green background |
| Error summary | `FormField` error prop with alert icon per field |
| Form sections | `FormSection` card with title + description |

## Navigation

- Skip-to-content link appears on Tab press (first focusable element)
- Breadcrumbs on all content pages
- Search (Cmd+K) available site-wide
- Mobile nav uses bottom sheet with focus trap
- Back buttons and escape keys close overlays
