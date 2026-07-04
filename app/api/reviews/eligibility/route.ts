import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";

/**
 * Lists the signed-in buyer's completed order items that don't have a product review yet, so the
 * UI can surface "Write a review" prompts. This is a read-only aggregation specific to this route,
 * not part of the ReviewEligibilityRepository domain interface (which only answers yes/no
 * eligibility for a single order item at write time).
 */
export async function GET() {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("id, product_id, product_name, order_id, created_at, orders!inner(id, buyer_id, status)")
      .eq("orders.buyer_id", user.id)
      .eq("orders.status", "completed")
      .not("product_id", "is", null)
      .order("created_at", { ascending: false });
    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    const items = orderItems ?? [];
    if (items.length === 0) {
      return NextResponse.json([]);
    }

    const { data: existingReviews, error: reviewsError } = await supabase
      .from("product_reviews")
      .select("order_item_id")
      .in("order_item_id", items.map((item) => item.id))
      .is("deleted_at", null);
    if (reviewsError) {
      return NextResponse.json({ error: reviewsError.message }, { status: 500 });
    }

    const reviewedOrderItemIds = new Set((existingReviews ?? []).map((r) => r.order_item_id));

    const pending = items
      .filter((item) => !reviewedOrderItemIds.has(item.id))
      .map((item) => ({
        orderItemId: item.id,
        orderId: item.order_id,
        productId: item.product_id,
        productName: item.product_name
      }));

    return NextResponse.json(pending);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
