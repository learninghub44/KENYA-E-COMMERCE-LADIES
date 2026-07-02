"use client"

import { useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function useServiceWorker() {
  const [swReady, setSwReady] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          setSwReady(true)
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true)
                }
              })
            }
          })
        })
        .catch(() => {})
    }

    if ("BeforeInstallPromptEvent" in window || true) {
      const handler = (e: Event) => {
        e.preventDefault()
        setInstallPrompt(e as unknown as BeforeInstallPromptEvent)
      }
      window.addEventListener("beforeinstallprompt", handler as EventListener)
      return () => window.removeEventListener("beforeinstallprompt", handler as EventListener)
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }
  }, [])

  const promptInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const result = await installPrompt.userChoice
    if (result.outcome === "accepted") {
      setInstallPrompt(null)
      setIsInstalled(true)
    }
  }

  const skipWaiting = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.waiting?.postMessage({ type: "SKIP_WAITING" })
      })
    }
    setUpdateAvailable(false)
  }

  return { swReady, updateAvailable, installPrompt, isInstalled, promptInstall, skipWaiting }
}

export { useServiceWorker }
export type { BeforeInstallPromptEvent }
