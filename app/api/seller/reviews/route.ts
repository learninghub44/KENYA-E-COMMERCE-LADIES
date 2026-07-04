import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import { createSupabaseSellerRepository } from "../../../../lib/seller/supabase-seller-repository";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sellerRepo = createSupabaseSellerRepository(supabase as any);
    const seller = await sellerRepo.findByOwnerId(user.id);
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const ratingFilter = searchParams.get("rating");
    const productFilter = searchParams.get("productId");
    const sort = searchParams.get("sort") ?? "most_recent";
    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = searchParams.has("limit") ? Number(searchParams.get("limit")) : 50;

    let query = supabase
      .from("product_reviews")
      .select("*, products!inner(id, name, slug, product_images(url, is_primary))")
      .eq("seller_id", seller.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (ratingFilter && ratingFilter !== "all") {
      query = query.eq("rating", Number(ratingFilter));
    }
    if (productFilter && productFilter !== "all") {
      query = query.eq("product_id", productFilter);
    }
    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data: reviews, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = (reviews ?? []).map((r: any) => ({
      id: r.id,
      productId: r.product_id,
      productName: r.products?.name ?? "Unknown Product",
      productSlug: r.products?.slug ?? "",
      productImage: r.products?.product_images?.find((img: any) => img.is_primary)?.url ?? null,
      buyerId: r.buyer_id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      status: r.status,
      isVerifiedPurchase: r.is_verified_purchase,
      helpfulCount: r.helpful_count,
      reportCount: r.report_count,
      createdAt: r.created_at,
      publishedAt: r.published_at,
    }));

    const totalRes = await supabase
      .from("product_reviews")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", seller.id)
      .is("deleted_at", null);

    const allReviews = await supabase
      .from("product_reviews")
      .select("rating")
      .eq("seller_id", seller.id)
      .is("deleted_at", null);

    const ratings = (allReviews.data ?? []).map((r: any) => r.rating);
    const totalReviews = ratings.length;
    const avgRating = totalReviews > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / totalReviews : 0;
    const distribution = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: ratings.filter((r: number) => r === stars).length,
    }));

    const productSet = new Set<string>();
    const productOptions: { id: string; name: string }[] = [];
    for (const r of items) {
      if (!productSet.has(r.productId)) {
        productSet.add(r.productId);
        productOptions.push({ id: r.productId, name: r.productName });
      }
    }

    return NextResponse.json({
      items,
      total: totalRes.count ?? 0,
      summary: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        distribution,
      },
      productOptions,
      nextCursor: items.length === limit ? items[items.length - 1]?.createdAt ?? null : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
