import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseClient } from "../../../../../../lib/supabase/server";
import { createSupabaseSellerRepository } from "../../../../../../lib/seller/supabase-seller-repository";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sellerRepo = createSupabaseSellerRepository(supabase as any);
    const seller = await sellerRepo.findByOwnerId(user.id);
    if (!seller) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    const { data: product } = await supabase
      .from("products")
      .select("id, seller_id, status")
      .eq("id", id)
      .eq("seller_id", seller.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.status !== "draft" && product.status !== "rejected") {
      return NextResponse.json(
        { error: `Cannot submit product with status "${product.status}". Only draft or rejected products can be submitted.` },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from("products")
      .update({
        status: "pending_review",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to submit product" }, { status: 500 });
    }

    const { data: updated } = await supabase
      .from("products")
      .select("*, product_images(*), product_variants(*), inventory_items(*)")
      .eq("id", id)
      .single();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
