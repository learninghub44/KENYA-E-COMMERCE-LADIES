"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "../../components/ui/button"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function SellerError({ reset }: ErrorProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center" role="alert">
      <div className="mb-6 rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-12 w-12 text-destructive" aria-hidden="true" />
      </div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mb-8 max-w-md text-sm text-muted-foreground">
        An error occurred while loading your seller dashboard. Please try again.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <a href="/seller">Go to dashboard</a>
        </Button>
      </div>
    </div>
  )
}
