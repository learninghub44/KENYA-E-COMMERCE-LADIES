"use client"

import { Download, X } from "lucide-react"
import { useState } from "react"

import { useServiceWorker } from "../../hooks/use-service-worker"
import { Button } from "../ui/button"

function PwaInstallPrompt() {
  const { installPrompt, isInstalled, promptInstall } = useServiceWorker()
  const [dismissed, setDismissed] = useState(false)

  if (!installPrompt || isInstalled || dismissed) return null

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-lg border bg-background p-4 shadow-lg"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-primary/10 p-2">
          <Download className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Install KEC Ladies</p>
          <p className="text-xs text-muted-foreground">Add to your home screen for the best experience</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss install prompt"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" className="flex-1" onClick={promptInstall}>
          <Download className="mr-2 h-4 w-4" />
          Install
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={() => setDismissed(true)}>
          Not now
        </Button>
      </div>
    </div>
  )
}

export { PwaInstallPrompt }
