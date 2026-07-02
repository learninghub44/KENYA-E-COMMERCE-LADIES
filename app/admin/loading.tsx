import { Skeleton } from "../../components/ui/skeleton"

export default function AdminLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-lg border p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading admin dashboard...</span>
    </div>
  )
}
