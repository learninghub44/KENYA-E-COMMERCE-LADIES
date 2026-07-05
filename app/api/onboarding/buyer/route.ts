import { NextResponse } from "next/server"
import { createSupabaseClient } from "../../../../lib/supabase/server"

export async function GET() {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, phone, avatar_url, metadata, default_country_code")
    .eq("id", user.id)
    .single()

  if (!data) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const meta = (data.metadata as Record<string, unknown>) ?? {}
  const onboarding = (meta.onboarding as Record<string, unknown>) ?? {}

  return NextResponse.json({
    profile: {
      displayName: data.display_name,
      phone: data.phone,
      avatarUrl: data.avatar_url,
      county: data.default_country_code,
    },
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

  const profileUpdates: Record<string, unknown> = {}
  if (stepData.displayName) profileUpdates.display_name = stepData.displayName
  if (stepData.phone) profileUpdates.phone = stepData.phone
  if (stepData.avatarUrl) profileUpdates.avatar_url = stepData.avatarUrl
  if (stepData.county) profileUpdates.default_country_code = stepData.county

  if (Object.keys(profileUpdates).length > 0) {
    const { error } = await supabase
      .from("profiles")
      .update(profileUpdates)
      .eq("id", user.id)
    if (error) return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }

  const { data: current } = await supabase
    .from("profiles")
    .select("metadata")
    .eq("id", user.id)
    .single()

  const existingMeta = (current?.metadata as Record<string, unknown>) ?? {}
  const onboarding = (existingMeta.onboarding as Record<string, unknown>) ?? {}

  const updatedMeta = {
    ...existingMeta,
    onboarding: {
      ...onboarding,
      [step]: stepData,
      currentStep: step,
      lastSavedAt: new Date().toISOString(),
      ...(step === "confirmation" ? { completed: true } : {}),
    },
  }

  const { error: metaError } = await supabase
    .from("profiles")
    .update({ metadata: updatedMeta, updated_at: new Date().toISOString() })
    .eq("id", user.id)

  if (metaError) return NextResponse.json({ error: "Failed to save progress" }, { status: 500 })

  return NextResponse.json({ ok: true })
}
