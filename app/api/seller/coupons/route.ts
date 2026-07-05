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

    const { data: coupons, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("seller_id", seller.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
    }

    return NextResponse.json({ coupons: coupons || [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { code, type, value, min_subtotal_minor, usage_limit, starts_at, ends_at } = body;

    if (!code || typeof code !== "string" || code.trim().length < 3) {
      return NextResponse.json({ error: "Code must be at least 3 characters" }, { status: 400 });
    }
    if (!type || !["percentage", "fixed"].includes(type)) {
      return NextResponse.json({ error: "Type must be percentage or fixed" }, { status: 400 });
    }
    if (typeof value !== "number" || value <= 0) {
      return NextResponse.json({ error: "Value must be greater than 0" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("coupons")
      .select("id")
      .eq("seller_id", seller.id)
      .eq("code", code.trim().toUpperCase())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });
    }

    const { data: coupon, error: insertError } = await supabase
      .from("coupons")
      .insert({
        code: code.trim().toUpperCase(),
        type,
        scope: "seller",
        seller_id: seller.id,
        value,
        currency: "KES",
        min_subtotal_minor: min_subtotal_minor || 0,
        usage_limit: usage_limit || null,
        used_count: 0,
        starts_at: starts_at || null,
        ends_at: ends_at || null,
        is_active: true,
      })
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
    }

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
