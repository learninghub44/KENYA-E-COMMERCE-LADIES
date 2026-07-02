"use client"

import { RefreshCw } from "lucide-react"

import { useServiceWorker } from "../../hooks/use-service-worker"
import { Button } from "../ui/button"

function PwaUpdateNotification() {
  const { updateAvailable, skipWaiting } = useServiceWorker()

  if (!updateAvailable) return null

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm rounded-lg border bg-background p-4 shadow-lg"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <RefreshCw className="h-5 w-5 text-primary" aria-hidden="true" />
        <p className="flex-1 text-sm font-medium">New version available</p>
        <Button size="sm" onClick={skipWaiting}>
          Update
        </Button>
      </div>
    </div>
  )
}

export { PwaUpdateNotification }
