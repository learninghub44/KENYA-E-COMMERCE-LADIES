import { NextResponse } from "next/server"
import { createSupabaseClient } from "../../../../lib/supabase/server"

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// Root cause of the seller-registration failure: the "welcome" step of the
// onboarding wizard never collects a store name (it's a purely informational
// screen), so the old code did `(stepData.storeName || "store")`, giving
// every single new seller the identical slug "store". sellers.slug has a
// unique constraint, so only the very first seller ever created could
// succeed; every insert after that failed with
// `duplicate key value violates unique constraint "sellers_slug_key"`.
// This generates a collision-safe placeholder slug up front, and is also
// used to re-derive (and de-duplicate) the slug once the user actually
// provides a store name in the "business" step, since the placeholder
// should not stick around forever.
async function generateUniqueSlug(
  supabase: Awaited<ReturnType<typeof createSupabaseClient>>,
  base: string,
  excludeSellerId?: string
): Promise<string> {
  const cleanBase = slugify(base) || "store"

  for (let attempt = 0; attempt < 6; attempt++) {
    const candidate = attempt === 0 ? cleanBase : `${cleanBase}-${Math.random().toString(36).slice(2, 8)}`

    let query = supabase.from("sellers").select("id").eq("slug", candidate)
    if (excludeSellerId) query = query.neq("id", excludeSellerId)
    const { data: existing } = await query.maybeSingle()

    if (!existing) return candidate
  }

  return `${cleanBase}-${Date.now().toString(36)}`
}

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
      const slug = await generateUniqueSlug(supabase, (stepData.storeName as string) || "store")

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

      if (error) {
        const devDetails =
          process.env.NODE_ENV !== "production"
            ? { code: error.code, details: error.details, hint: error.hint }
            : undefined
        return NextResponse.json({ error: error.message, ...devDetails }, { status: 500 })
      }

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
    if (stepData.storeName) {
      sellerUpdates.store_name = stepData.storeName
      // The seller row is created on the "welcome" step with a placeholder
      // slug (before the real store name exists). Now that the user has
      // provided one, re-derive the public slug from it instead of leaving
      // the placeholder in place forever.
      sellerUpdates.slug = await generateUniqueSlug(supabase, stepData.storeName as string, existingSeller.id)
    }
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
    if (error) {
      const devDetails =
        process.env.NODE_ENV !== "production"
          ? { code: error.code, details: error.details, hint: error.hint }
          : undefined
      return NextResponse.json({ error: error.message, ...devDetails }, { status: 500 })
    }
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
