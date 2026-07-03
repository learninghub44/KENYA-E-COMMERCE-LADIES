import { NextRequest, NextResponse } from "next/server"
import { createSupabaseClient } from "../../../../lib/supabase/server"
import { createSupabaseSellerRepository, createSellerService } from "../../../../lib/seller"

// Applying as a seller was previously impossible from the UI: "Become a
// Seller" only linked to the generic buyer registration form, and nothing
// ever created a sellers row or granted the seller role. This route wires
// the existing (until now unused) lib/seller/seller-service.ts to a real
// endpoint. It runs as the signed-in user via their session cookies, so
// the "seller owners can create stores" RLS policy (owner_id = auth.uid())
// applies normally -- no service-role key needed. The seller role itself is
// granted by the on_seller_created DB trigger, not by this route.
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: "You need to sign in before applying to sell." },
      { status: 401 }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const service = createSellerService({
    sellers: createSupabaseSellerRepository(supabase as any),
    // Role granting happens via the on_seller_created SECURITY DEFINER
    // trigger (see supabase/migrations/202607030005_*), since user_roles is
    // staff-managed only under RLS and this route runs with the applicant's
    // own session, not elevated privileges.
    roles: { grantSellerRole: async () => {} },
  })

  const result = await service.apply({ ...body, userId: user.id })

  if (!result.ok) {
    return NextResponse.json({ error: result.message, code: result.code }, { status: result.status })
  }

  return NextResponse.json({ seller: result.data }, { status: 201 })
}
