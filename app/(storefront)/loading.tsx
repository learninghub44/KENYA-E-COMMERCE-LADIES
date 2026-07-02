import { Skeleton } from "../../components/ui/skeleton"

export default function StorefrontLoading() {
  return (
    <div className="container mx-auto px-4 py-8" role="status" aria-label="Loading page">
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4 max-w-xl" />
          <Skeleton className="h-5 w-1/2 max-w-md" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-5 w-1/3" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading storefront...</span>
    </div>
  )
}
