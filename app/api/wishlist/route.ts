import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "../../../lib/supabase/server";
import { createSupabaseWishlistRepository } from "../../../lib/marketplace/supabase-wishlist-repository";
import { createWishlistService } from "../../../lib/marketplace/wishlist-service";

function buildService(supabase: any) {
  return createWishlistService({
    wishlists: createSupabaseWishlistRepository(supabase)
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wishlistName = request.nextUrl.searchParams.get("name") ?? "Default";
    const service = buildService(supabase);
    const result = await service.view(user.id, wishlistName);
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }
    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
      wishlistName: body.wishlistName ?? "Default"
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }
    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
