import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseClient } from "../../../../../lib/supabase/server";
import { createSupabaseSellerRepository } from "../../../../../lib/seller/supabase-seller-repository";

async function verifyOwnership(supabase: Awaited<ReturnType<typeof createSupabaseClient>>, userId: string, couponId: string) {
  const sellerRepo = createSupabaseSellerRepository(supabase as any);
  const seller = await sellerRepo.findByOwnerId(userId);
  if (!seller) return { error: NextResponse.json({ error: "Seller profile not found" }, { status: 404 }) };

  const { data: coupon } = await supabase
    .from("coupons")
    .select("id, seller_id")
    .eq("id", couponId)
    .maybeSingle();

  if (!coupon || coupon.seller_id !== seller.id) {
    return { error: NextResponse.json({ error: "Coupon not found" }, { status: 404 }) };
  }

  return { seller };
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ownership = await verifyOwnership(supabase, user.id, id);
    if ("error" in ownership) return ownership.error;

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.code !== undefined) updates.code = body.code.trim().toUpperCase();
    if (body.value !== undefined) updates.value = body.value;
    if (body.min_subtotal_minor !== undefined) updates.min_subtotal_minor = body.min_subtotal_minor;
    if (body.usage_limit !== undefined) updates.usage_limit = body.usage_limit;
    if (body.ends_at !== undefined) updates.ends_at = body.ends_at;
    if (body.is_active !== undefined) updates.is_active = body.is_active;

    const { data: coupon, error } = await supabase
      .from("coupons")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ownership = await verifyOwnership(supabase, user.id, id);
    if ("error" in ownership) return ownership.error;

    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
