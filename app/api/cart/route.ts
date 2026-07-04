import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "../../../lib/supabase/server";
import { createSupabaseCartRepository, createSupabaseCartItemRepository } from "../../../lib/cart/supabase-cart-repository";
import { createSupabaseProductReader } from "../../../lib/products/supabase-product-reader";
import { createCartService } from "../../../lib/cart/cart-service";

function buildService(supabase: any) {
  return createCartService({
    carts: createSupabaseCartRepository(supabase),
    items: createSupabaseCartItemRepository(supabase),
    products: createSupabaseProductReader(supabase)
  });
}

export async function GET() {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = buildService(supabase);
    const result = await service.view({ userId: user.id });
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }
    return NextResponse.json(result.data);
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
    const result = await service.add({
      userId: user.id,
      productId: body.productId,
      variantId: body.variantId ?? undefined,
      quantity: body.quantity ?? 1
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }
    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
