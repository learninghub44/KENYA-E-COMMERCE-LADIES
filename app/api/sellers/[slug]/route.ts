import { NextRequest, NextResponse } from "next/server"
import { createSupabaseClient } from "../../../../lib/supabase/server"
import { createSupabaseSellerRepository } from "../../../../lib/seller"
import { createSellerService } from "../../../../lib/seller"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createSupabaseClient()
    const service = createSellerService({
      sellers: createSupabaseSellerRepository(supabase as any),
      roles: { grantSellerRole: async () => {} },
    })
    const result = await service.getBySlug(slug)
    if (!result.ok) {
      return NextResponse.json({ error: result.message, code: result.code }, { status: result.status })
    }

    const seller = result.data

    let rating: { averageRating: number; totalReviews: number } | null = null
    try {
      const { data: ratingRow } = await supabase
        .from("rating_summaries")
        .select("average_rating, total_reviews")
        .eq("entity_type", "seller")
        .eq("entity_id", seller.id)
        .maybeSingle()
      if (ratingRow) {
        rating = {
          averageRating: Number(ratingRow.average_rating),
          totalReviews: Number(ratingRow.total_reviews),
        }
      }
    } catch {
      // rating is optional — don't fail if the table is unreachable
    }

    return NextResponse.json({ seller, rating })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
