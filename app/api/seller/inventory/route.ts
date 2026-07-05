import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import { createSupabaseSellerRepository } from "../../../../lib/seller/supabase-seller-repository";

export async function GET() {
  try {
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

    const { data: items, error } = await supabase
      .from("inventory_items")
      .select("*, products!inner(id, name, slug, seller_id, base_price_minor, currency), product_variants(id, sku, title, options)")
      .eq("products.seller_id", seller.id)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
    }

    return NextResponse.json({ items: items || [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { inventoryItemId, quantityAvailable, lowStockThreshold, trackInventory } = body;

    if (!inventoryItemId) {
      return NextResponse.json({ error: "inventoryItemId is required" }, { status: 400 });
    }

    const { data: item } = await supabase
      .from("inventory_items")
      .select("id, products!inner(seller_id)")
      .eq("id", inventoryItemId)
      .maybeSingle();

    if (!item || (item as any).products.seller_id !== seller.id) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (quantityAvailable !== undefined) updates.quantity_available = quantityAvailable;
    if (lowStockThreshold !== undefined) updates.low_stock_threshold = lowStockThreshold;
    if (trackInventory !== undefined) updates.track_inventory = trackInventory;

    const { data: updated, error } = await supabase
      .from("inventory_items")
      .update(updates)
      .eq("id", inventoryItemId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
