import { NextResponse } from "next/server"
import { createSupabaseClient } from "../../../../lib/supabase/server"

export async function GET() {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: seller } = await supabase
    .from("sellers")
    .select("id, store_name, slug, description, logo_url, banner_url, status, kyc_status, support_email, support_phone, metadata, country_code")
    .eq("owner_id", user.id)
    .maybeSingle()

  const meta = (seller?.metadata as Record<string, unknown>) ?? {}
  const onboarding = (meta.onboarding as Record<string, unknown>) ?? {}

  return NextResponse.json({
    seller: seller
      ? {
          id: seller.id,
          storeName: seller.store_name,
          slug: seller.slug,
          description: seller.description,
          logoUrl: seller.logo_url,
          bannerUrl: seller.banner_url,
          status: seller.status,
          kycStatus: seller.kyc_status,
          supportEmail: seller.support_email,
          supportPhone: seller.support_phone,
          county: seller.country_code,
        }
      : null,
    onboarding,
    completed: onboarding.completed === true,
  })
}

export async function POST(request: Request) {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { step, data: stepData } = body as { step: string; data: Record<string, unknown> }

  const { data: existingSeller } = await supabase
    .from("sellers")
    .select("id, metadata")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (step === "welcome") {
    if (!existingSeller) {
      const slug = ((stepData.storeName as string) || "store")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      const { data: newSeller, error } = await supabase
        .from("sellers")
        .insert({
          owner_id: user.id,
          store_name: (stepData.storeName as string) || "My Store",
          slug,
          status: "draft",
        })
        .select("id")
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      const meta: Record<string, unknown> = { onboarding: { currentStep: step, lastSavedAt: new Date().toISOString() } }
      await supabase.from("sellers").update({ metadata: meta }).eq("id", newSeller.id)

      return NextResponse.json({ ok: true, sellerId: newSeller.id })
    }
  }

  if (!existingSeller) {
    return NextResponse.json({ error: "Seller account not found. Please complete step 1 first." }, { status: 404 })
  }

  const sellerUpdates: Record<string, unknown> = {}
  if (step === "business") {
    if (stepData.storeName) sellerUpdates.store_name = stepData.storeName
    if (stepData.description) sellerUpdates.description = stepData.description
    if (stepData.county) sellerUpdates.country_code = stepData.county
    if (stepData.supportEmail) sellerUpdates.support_email = stepData.supportEmail
    if (stepData.supportPhone) sellerUpdates.support_phone = stepData.supportPhone
  }
  if (step === "branding") {
    if (stepData.logoUrl) sellerUpdates.logo_url = stepData.logoUrl
    if (stepData.bannerUrl) sellerUpdates.banner_url = stepData.bannerUrl
    if (stepData.description) sellerUpdates.description = stepData.description
  }
  if (step === "contact") {
    if (stepData.supportEmail) sellerUpdates.support_email = stepData.supportEmail
    if (stepData.supportPhone) sellerUpdates.support_phone = stepData.supportPhone
  }

  if (Object.keys(sellerUpdates).length > 0) {
    const { error } = await supabase
      .from("sellers")
      .update(sellerUpdates)
      .eq("id", existingSeller.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const existingMeta = (existingSeller.metadata as Record<string, unknown>) ?? {}
  const onboarding = (existingMeta.onboarding as Record<string, unknown>) ?? {}

  const updatedMeta = {
    ...existingMeta,
    onboarding: {
      ...onboarding,
      [step]: stepData,
      currentStep: step,
      lastSavedAt: new Date().toISOString(),
      ...(step === "success" ? { completed: true } : {}),
    },
  }

  const { error: metaError } = await supabase
    .from("sellers")
    .update({ metadata: updatedMeta, updated_at: new Date().toISOString() })
    .eq("id", existingSeller.id)

  if (metaError) return NextResponse.json({ error: metaError.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
