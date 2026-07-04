"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"
import { Toaster } from "sonner"

import { ThemeProvider } from "./theme-provider"
import { PwaInstallPrompt } from "./pwa-install-prompt"
import { PwaUpdateNotification } from "./pwa-update-notification"
import { AuthProvider } from "../../lib/auth/auth-context"

interface ProvidersProps {
  children: ReactNode
}

function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
          <PwaInstallPrompt />
          <PwaUpdateNotification />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export { Providers }
