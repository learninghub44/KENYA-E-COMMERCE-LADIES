import { redirect } from "next/navigation"

import { Card, CardContent } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import Link from "next/link"
import { createSupabaseClient } from "../../../lib/supabase/server"
import { createSupabaseSellerRepository } from "../../../lib/seller"
import { StoreProfileForm, type StoreProfileInitialValues } from "./store-profile-form"

export default async function StoreProfilePage() {
  const supabase = await createSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login?redirectTo=/seller/store")

  const seller = await createSupabaseSellerRepository(supabase as any).findByOwnerId(user.id)

  if (!seller) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Store Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your store information and branding.</p>
        </div>
        <Card>
          <CardContent className="space-y-4 py-12 text-center text-muted-foreground">
            <p>No seller account is linked to this session.</p>
            <Button asChild>
              <Link href="/become-a-seller/apply">Apply to become a seller</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const metadata = seller.metadata as Record<string, any>
  const businessAddress = metadata?.businessAddress ?? {}
  const socialLinks = metadata?.socialLinks ?? {}
  const storePolicies = metadata?.storePolicies ?? {}

  const initialValues: StoreProfileInitialValues = {
    storeName: seller.storeName ?? "",
    description: seller.description ?? "",
    supportEmail: seller.supportEmail ?? "",
    supportPhone: seller.supportPhone ?? "",
    addressLine1: businessAddress.line1 ?? "",
    addressCity: businessAddress.city ?? "",
    addressCountryCode: businessAddress.countryCode ?? seller.countryCode ?? "KE",
    instagram: socialLinks.instagram ?? "",
    facebook: socialLinks.facebook ?? "",
    twitter: socialLinks.twitter ?? "",
    whatsapp: socialLinks.whatsapp ?? "",
    shippingPolicy: storePolicies.shipping ?? "",
    returnsPolicy: storePolicies.returns ?? "",
    paymentPolicy: "",
  }

  return <StoreProfileForm initialValues={initialValues} />
}
