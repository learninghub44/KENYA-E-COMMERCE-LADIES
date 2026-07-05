import { NextRequest, NextResponse } from "next/server"
import { createSupabaseClient } from "../../../../../lib/supabase/server"
import { z } from "zod"

const addressUpdateSchema = z.object({
  label: z.string().optional(),
  recipient_name: z.string().min(1, "Name is required").optional(),
  phone: z.string().min(10, "Valid phone number required").optional(),
  line1: z.string().min(5, "Street address is required").optional(),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required").optional(),
  region: z.string().optional(),
  postal_code: z.string().optional(),
  country_code: z.string().min(2).optional(),
  is_default_shipping: z.boolean().optional(),
  is_default_billing: z.boolean().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { data: existing, error: fetchError } = await supabase
      .from("addresses")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = addressUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid address data", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { is_default_shipping, is_default_billing } = parsed.data

    if (is_default_shipping || is_default_billing) {
      if (is_default_shipping) {
        await supabase
          .from("addresses")
          .update({ is_default_shipping: false })
          .eq("user_id", user.id)
          .eq("is_default_shipping", true)
          .neq("id", id)
      }
      if (is_default_billing) {
        await supabase
          .from("addresses")
          .update({ is_default_billing: false })
          .eq("user_id", user.id)
          .eq("is_default_billing", true)
          .neq("id", id)
      }
    }

    const { data, error } = await supabase
      .from("addresses")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to update address" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { data: existing, error: fetchError } = await supabase
      .from("addresses")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
