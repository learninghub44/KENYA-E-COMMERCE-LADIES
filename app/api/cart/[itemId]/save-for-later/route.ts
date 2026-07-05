import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../../lib/supabase/server";
import { createSupabaseCartRepository, createSupabaseCartItemRepository } from "../../../../../lib/cart/supabase-cart-repository";
import { createSupabaseProductReader } from "../../../../../lib/products/supabase-product-reader";
import { createCartService } from "../../../../../lib/cart/cart-service";

type RouteParams = { params: Promise<{ itemId: string }> };

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { itemId } = await params;
    const supabase = await createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = createCartService({
      carts: createSupabaseCartRepository(supabase),
      items: createSupabaseCartItemRepository(supabase),
      products: createSupabaseProductReader(supabase)
    });
    const result = await service.saveForLater({ userId: user.id, itemId });
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }
    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
