"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Store, CheckCircle2 } from "lucide-react"

import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Textarea } from "../../../../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { createSupabaseBrowserClient } from "../../../../lib/supabase/client"

type PageState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "ready" }
  | { status: "already-seller"; storeName: string; sellerStatus: string }
  | { status: "submitted"; storeName: string }

export default function BecomeASellerApplyPage() {
  const router = useRouter()
  const [state, setState] = useState<PageState>({ status: "loading" })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [storeName, setStoreName] = useState("")
  const [businessCategory, setBusinessCategory] = useState("")
  const [storeDescription, setStoreDescription] = useState("")
  const [supportEmail, setSupportEmail] = useState("")
  const [supportPhone, setSupportPhone] = useState("")

  useEffect(() => {
    let cancelled = false

    async function load() {
      const supabase = createSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        if (!cancelled) setState({ status: "signed-out" })
        return
      }

      const { data: existingSeller } = await supabase
        .from("sellers")
        .select("store_name, status")
        .eq("owner_id", user.id)
        .maybeSingle()

      if (cancelled) return

      if (existingSeller) {
        setState({
          status: "already-seller",
          storeName: existingSeller.store_name as string,
          sellerStatus: existingSeller.status as string,
        })
      } else {
        setState({ status: "ready" })
      }
    }

    load().catch(() => {
      if (!cancelled) setState({ status: "signed-out" })
    })

    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const response = await fetch("/api/sellers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          businessCategory,
          storeDescription: storeDescription || undefined,
          supportEmail: supportEmail || undefined,
          supportPhone: supportPhone || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }

      setState({ status: "submitted", storeName })
    } catch {
      setError("Something went wrong. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (state.status === "signed-out") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <Store className="mb-4 h-10 w-10 text-primary" aria-hidden="true" />
        <h1 className="mb-2 text-2xl font-semibold">Create an account first</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          You&apos;ll need a Zuri Market account before applying to sell. It only takes a minute.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/auth/register?redirectTo=/become-a-seller/apply">Create account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/login?redirectTo=/become-a-seller/apply">Sign in</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (state.status === "already-seller") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <CheckCircle2 className="mb-4 h-10 w-10 text-primary" aria-hidden="true" />
        <h1 className="mb-2 text-2xl font-semibold">You&apos;re already a seller</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          <strong>{state.storeName}</strong> is registered with status{" "}
          <span className="font-medium">{state.sellerStatus.replace(/_/g, " ")}</span>.
        </p>
        <Button asChild>
          <Link href="/seller">Go to Seller Hub</Link>
        </Button>
      </div>
    )
  }

  if (state.status === "submitted") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <CheckCircle2 className="mb-4 h-10 w-10 text-primary" aria-hidden="true" />
        <h1 className="mb-2 text-2xl font-semibold">Application received</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          <strong>{state.storeName}</strong> has been created. Head to the Seller Hub to complete
          your KYC verification and start listing products.
        </p>
        <Button
          onClick={() => {
            router.push("/seller")
            router.refresh()
          }}
        >
          Go to Seller Hub
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Tell us about your store</h1>
        <p className="text-muted-foreground">
          This creates your seller account. You&apos;ll complete KYC verification and product
          setup from the Seller Hub afterward.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Store details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="storeName">Store name</Label>
              <Input
                id="storeName"
                required
                minLength={2}
                maxLength={120}
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Amani Beauty Co."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessCategory">Business category</Label>
              <Input
                id="businessCategory"
                required
                minLength={2}
                maxLength={100}
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value)}
                placeholder="e.g. Fashion, Beauty, Skincare"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeDescription">Store description</Label>
              <Textarea
                id="storeDescription"
                maxLength={2000}
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                placeholder="What do you sell, and what makes your store worth shopping at?"
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  maxLength={320}
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="you@yourstore.co.ke"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportPhone">Support phone</Label>
                <Input
                  id="supportPhone"
                  type="tel"
                  maxLength={32}
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Create seller account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
