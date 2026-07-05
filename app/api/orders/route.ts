import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "../../../lib/supabase/server";
import { createSupabaseOrderRepository } from "../../../lib/orders/supabase-order-repository";
import { createOrderService } from "../../../lib/orders/order-service";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = request.nextUrl.searchParams;
    const cursor = params.get("cursor") ?? undefined;
    const limit = params.has("limit") ? Number(params.get("limit")) : 50;

    const service = createOrderService({ orders: createSupabaseOrderRepository(supabase) });
    const result = await service.listForBuyer(user.id, cursor, limit);
    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
