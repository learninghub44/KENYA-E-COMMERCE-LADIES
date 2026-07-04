import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import {
  createSupabaseHelpfulVoteRepository,
  createSupabaseProductReviewRepository,
  createSupabaseReviewEligibilityRepository,
  createSupabaseReviewReportRepository,
  createSupabaseSellerReviewRepository
} from "../../../../lib/reviews/supabase-review-repository";
import { createReviewService } from "../../../../lib/reviews/review-service";

function buildService(supabase: any) {
  return createReviewService({
    productReviews: createSupabaseProductReviewRepository(supabase),
    sellerReviews: createSupabaseSellerReviewRepository(supabase),
    eligibility: createSupabaseReviewEligibilityRepository(supabase),
    helpfulVotes: createSupabaseHelpfulVoteRepository(supabase),
    reports: createSupabaseReviewReportRepository(supabase)
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const service = buildService(supabase);
    const { searchParams } = request.nextUrl;

    const result = await service.productReviews({
      productId: searchParams.get("productId") ?? undefined,
      sellerId: searchParams.get("sellerId") ?? undefined,
      rating: searchParams.get("rating") ? Number(searchParams.get("rating")) : undefined,
      verifiedOnly: searchParams.get("verifiedOnly") === "true" ? true : undefined,
      sort: (searchParams.get("sort") as any) ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const service = buildService(supabase);
    const result = await service.createProductReview({
      buyerId: user.id,
      orderItemId: body.orderItemId,
      rating: body.rating,
      title: body.title,
      body: body.body,
      media: body.media ?? undefined
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }
    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
