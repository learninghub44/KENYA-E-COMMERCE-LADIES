"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function BecomeASellerApplyRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/onboarding/seller")
  }, [router])
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="h-6 w-6 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Redirecting to store setup...</p>
      </div>
    </div>
  )
}
