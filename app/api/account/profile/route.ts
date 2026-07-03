import { NextResponse } from "next/server"
import { createSupabaseClient } from "../../../../lib/supabase/server"
import { createSupabaseProfileRepository } from "../../../../lib/auth/supabase-profile-repository"
import { profileUpdateSchema } from "../../../../lib/auth/schemas"

export async function GET() {
  const supabase = await createSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profiles = createSupabaseProfileRepository(supabase)
  const profile = await profiles.findByUserId(user.id)

  return NextResponse.json(profile)
}

export async function PUT(request: Request) {
  const supabase = await createSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = profileUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Profile input is invalid.", details: parsed.error.flatten() }, { status: 400 })
  }

  const profiles = createSupabaseProfileRepository(supabase)
  await profiles.updateProfile({ userId: user.id, ...parsed.data })

  if (parsed.data.email) {
    const { error: updateError } = await supabase.auth.updateUser({ email: parsed.data.email })
    if (updateError) {
      return NextResponse.json({ error: "Failed to update email." }, { status: 400 })
    }
  }

  return NextResponse.json({ ok: true })
}
