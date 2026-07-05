import { NextRequest, NextResponse } from "next/server"
import { createSupabaseClient } from "../../../../lib/supabase/server"
import { z } from "zod"

const addressSchema = z.object({
  label: z.string().optional(),
  recipient_name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  line1: z.string().min(5, "Street address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  region: z.string().optional(),
  postal_code: z.string().optional(),
  country_code: z.string().min(2, "Country is required").default("KE"),
  is_default_shipping: z.boolean().default(false),
  is_default_billing: z.boolean().default(false),
})

export async function GET() {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default_shipping", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = addressSchema.safeParse(body)

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
      }
      if (is_default_billing) {
        await supabase
          .from("addresses")
          .update({ is_default_billing: false })
          .eq("user_id", user.id)
          .eq("is_default_billing", true)
      }
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to save address" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
