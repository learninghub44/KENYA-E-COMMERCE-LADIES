import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseClient } from "../../../../../../lib/supabase/server";
import { createSupabaseSellerRepository } from "../../../../../../lib/seller/supabase-seller-repository";
import { slugifyProductName } from "../../../../../../lib/products/schemas";

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

    const { data: original } = await supabase
      .from("products")
      .select("*, product_images(*), product_variants(*), inventory_items(*)")
      .eq("id", id)
      .eq("seller_id", seller.id)
      .is("deleted_at", null)
      .single();

    if (!original) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let slug = `${original.slug}-copy`;
    let attempt = 0;
    while (true) {
      const testSlug = attempt === 0 ? slug : `${slug}-${attempt}`;
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("seller_id", seller.id)
        .eq("slug", testSlug)
        .maybeSingle();
      if (!existing) {
        slug = testSlug;
        break;
      }
      attempt += 1;
      if (attempt > 50) {
        return NextResponse.json({ error: "Could not generate unique slug" }, { status: 409 });
      }
    }

    const { data: newProduct, error: insertError } = await supabase
      .from("products")
      .insert({
        seller_id: seller.id,
        category_id: original.category_id,
        brand_id: original.brand_id,
        name: `${original.name} - Copy`,
        slug,
        description: original.description,
        status: "draft",
        base_price_minor: original.base_price_minor,
        compare_at_price_minor: original.compare_at_price_minor,
        currency: original.currency,
        is_featured: false,
        metadata: original.metadata,
      })
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    for (const img of original.product_images || []) {
      await supabase.from("product_images").insert({
        product_id: newProduct.id,
        url: img.url,
        alt_text: img.alt_text,
        sort_order: img.sort_order,
        is_primary: img.is_primary,
        variant_id: null,
      });
    }

    for (const v of original.product_variants || []) {
      const { id: _vId, created_at: _ca, updated_at: _ua, ...vData } = v;
      await supabase.from("product_variants").insert({
        ...vData,
        product_id: newProduct.id,
        sku: `${v.sku}-COPY`,
      });
    }

    const inv = (original.inventory_items || [])[0];
    if (inv) {
      await supabase.from("inventory_items").insert({
        product_id: newProduct.id,
        variant_id: null,
        quantity_available: inv.quantity_available,
        quantity_reserved: 0,
        low_stock_threshold: inv.low_stock_threshold,
        track_inventory: inv.track_inventory,
      });
    }

    const { data: fullProduct } = await supabase
      .from("products")
      .select("*, product_images(*), product_variants(*), inventory_items(*)")
      .eq("id", newProduct.id)
      .single();

    return NextResponse.json(fullProduct || newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
