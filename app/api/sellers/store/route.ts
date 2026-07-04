import { NextRequest, NextResponse } from "next/server"
import { createSupabaseClient } from "../../../../lib/supabase/server"
import { createSupabaseSellerRepository, createSellerService } from "../../../../lib/seller"

// Backs app/seller/store/page.tsx. Previously that page's onSubmit just did
// console.log(data) -- nothing a seller entered there was ever saved. This
// route wires it to the existing (until now unused) service.updateStore.
export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "You need to sign in to update your store." }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const sellerRepository = createSupabaseSellerRepository(supabase as any)
  const service = createSellerService({
    sellers: sellerRepository,
    roles: { grantSellerRole: async () => {} },
  })

  try {
    const seller = await sellerRepository.findByOwnerId(user.id)
    if (!seller) {
      return NextResponse.json({ error: "No seller account is linked to this session." }, { status: 404 })
    }

    const result = await service.updateStore({ ...body, sellerId: seller.id }, user.id)
    if (!result.ok) {
      return NextResponse.json({ error: result.message, code: result.code }, { status: result.status })
    }

    return NextResponse.json({ seller: result.data })
  } catch (error) {
    console.error("[sellers/store] unexpected error", error)
    return NextResponse.json(
      { error: "Something went wrong while saving your store. Please try again." },
      { status: 500 }
    )
  }
}
