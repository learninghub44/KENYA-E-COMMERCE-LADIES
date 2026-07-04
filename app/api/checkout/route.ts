import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "../../../lib/supabase/server";
import { createSupabaseCartRepository, createSupabaseCartItemRepository } from "../../../lib/cart/supabase-cart-repository";
import { createSupabaseCouponRepository } from "../../../lib/checkout/supabase-coupon-repository";
import { createSupabaseInventoryRepository } from "../../../lib/checkout/supabase-inventory-repository";
import { createSupabaseOrderRepository } from "../../../lib/orders/supabase-order-repository";
import { createCheckoutService } from "../../../lib/checkout/checkout-service";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const carts = createSupabaseCartRepository(supabase);
    const cartItems = createSupabaseCartItemRepository(supabase);
    const cart = await carts.findActiveByUser(user.id);
    if (!cart) {
      return NextResponse.json({ error: "Active cart not found." }, { status: 404 });
    }

    const service = createCheckoutService({
      carts,
      cartItems,
      coupons: createSupabaseCouponRepository(supabase),
      orders: createSupabaseOrderRepository(supabase),
      inventory: createSupabaseInventoryRepository(supabase)
    });

    const result = await service.confirm({
      buyerId: user.id,
      cartId: cart.id,
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress ?? undefined,
      couponCode: body.couponCode ?? undefined,
      notes: body.notes ?? undefined
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message, code: result.code }, { status: result.status });
    }
    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
