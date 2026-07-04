import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import { createSupabaseSellerRepository } from "../../../../lib/seller/supabase-seller-repository";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sellerRepo = createSupabaseSellerRepository(supabase as any);
    const seller = await sellerRepo.findByOwnerId(user.id);
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get("range") || "30d";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate: Date;
    switch (range) {
      case "7d":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6);
        break;
      case "90d":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 89);
        break;
      case "1y":
        startDate = new Date(today);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 29);
    }
    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = today.toISOString().slice(0, 10);

    const [ordersRes, prevOrdersRes, productsRes] = await Promise.all([
      supabase
        .from("orders")
        .select("id, status, total_minor, created_at")
        .eq("seller_id", seller.id)
        .gte("created_at", startStr)
        .lte("created_at", endStr + "T23:59:59"),
      supabase
        .from("orders")
        .select("id, status, total_minor, created_at")
        .eq("seller_id", seller.id)
        .gte("created_at", new Date(startDate.getTime() - (today.getTime() - startDate.getTime())).toISOString().slice(0, 10))
        .lte("created_at", startStr + "T00:00:00"),
      supabase
        .from("products")
        .select("id, status, name")
        .eq("seller_id", seller.id)
        .is("deleted_at", null),
    ]);

    const orders = ordersRes.data ?? [];
    const prevOrders = prevOrdersRes.data ?? [];
    const products = productsRes.data ?? [];

    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total_minor ?? 0), 0);
    const prevRevenue = prevOrders.reduce((sum: number, o: any) => sum + (o.total_minor ?? 0), 0);
    const totalOrders = orders.length;
    const prevTotalOrders = prevOrders.length;
    const completedOrders = orders.filter((o: any) => o.status === "completed" || o.status === "delivered").length;
    const pendingOrders = orders.filter((o: any) => o.status === "pending" || o.status === "processing").length;
    const cancelledOrders = orders.filter((o: any) => o.status === "cancelled" || o.status === "refunded").length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const activeProducts = products.filter((p: any) => p.status === "active").length;
    const draftProducts = products.filter((p: any) => p.status === "draft").length;

    const revenueTrend = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersTrend = prevTotalOrders > 0 ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 : 0;

    const dailyMap = new Map<string, { revenue: number; orderCount: number }>();
    for (const o of orders) {
      const day = (o.created_at as string).slice(0, 10);
      const entry = dailyMap.get(day) ?? { revenue: 0, orderCount: 0 };
      entry.revenue += o.total_minor ?? 0;
      entry.orderCount += 1;
      dailyMap.set(day, entry);
    }
    const daily = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }));

    const statusCounts = new Map<string, number>();
    for (const o of orders) {
      const s = (o.status as string) ?? "unknown";
      statusCounts.set(s, (statusCounts.get(s) ?? 0) + 1);
    }
    const orderStatusBreakdown = Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count }));

    const productStatusCounts = new Map<string, number>();
    for (const p of products) {
      const s = (p.status as string) ?? "unknown";
      productStatusCounts.set(s, (productStatusCounts.get(s) ?? 0) + 1);
    }
    const productStatusBreakdown = Array.from(productStatusCounts.entries()).map(([status, count]) => ({ status, count }));

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        avgOrderValue,
        revenueTrend: Math.round(revenueTrend * 10) / 10,
        ordersTrend: Math.round(ordersTrend * 10) / 10,
      },
      products: {
        total: products.length,
        active: activeProducts,
        draft: draftProducts,
      },
      daily,
      orderStatusBreakdown,
      productStatusBreakdown,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
