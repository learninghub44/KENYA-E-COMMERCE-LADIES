import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseClient();

  let revenueByCategory: { name: string; value: number; color: string }[] = [];
  let sellerRankings: { rank: number; store: string; owner: string; revenue: string; orders: number; rating: number }[] = [];
  let topProducts: { name: string; seller: string; revenue: string; units: number }[] = [];
  let totalRevenue = 0;
  let totalOrders = 0;
  let totalProducts = 0;
  let totalSellers = 0;

  const colors = ["hsl(var(--primary))", "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981"];

  try {
    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select("id, total_amount, seller_id, products(name, sellers(store_name, profiles(full_name)))");

    if (!ordersErr && orders) {
      totalOrders = orders.length;
      totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount ?? 0), 0);

      const categoryMap = new Map<string, number>();
      const sellerMap = new Map<string, { store: string; owner: string; revenue: number; orders: number }>();
      const productMap = new Map<string, { name: string; seller: string; revenue: number; units: number }>();

      for (const order of orders) {
        const products = order.products as unknown as { name: string; sellers?: { store_name?: string; profiles?: { full_name?: string } } }[] | null;
        if (!Array.isArray(products)) continue;

        for (const product of products) {
          const cat = "General";
          categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + (order.total_amount ?? 0));

          const sellerName = product.sellers?.store_name ?? "Unknown Store";
          const ownerName = product.sellers?.profiles?.full_name ?? "Unknown";
          const existing = sellerMap.get(order.seller_id ?? "");
          if (existing) {
            existing.revenue += order.total_amount ?? 0;
            existing.orders += 1;
          } else {
            sellerMap.set(order.seller_id ?? "", {
              store: sellerName,
              owner: ownerName,
              revenue: order.total_amount ?? 0,
              orders: 1,
            });
          }

          const prodName = product.name;
          const pKey = `${prodName}-${order.seller_id}`;
          const existingProd = productMap.get(pKey);
          if (existingProd) {
            existingProd.revenue += order.total_amount ?? 0;
            existingProd.units += 1;
          } else {
            productMap.set(pKey, {
              name: prodName,
              seller: sellerName,
              revenue: order.total_amount ?? 0,
              units: 1,
            });
          }
        }
      }

      revenueByCategory = [...categoryMap.entries()]
        .map(([name, value], i) => ({ name, value, color: colors[i % colors.length] ?? "hsl(var(--primary))" }));

      sellerRankings = [...sellerMap.entries()]
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5)
        .map(([id, s], i) => ({
          rank: i + 1,
          store: s.store,
          owner: s.owner,
          revenue: `KES ${Math.round(s.revenue / 1000)}K`,
          orders: s.orders,
          rating: 4.5,
        }));

      topProducts = [...productMap.values()]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((p) => ({
          name: p.name,
          seller: p.seller,
          revenue: `KES ${Math.round(p.revenue / 1000)}K`,
          units: p.units,
        }));
    }
  } catch {
    // Tables may not exist
  }

  try {
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true });
    totalProducts = count ?? 0;
  } catch { /* ignore */ }

  try {
    const { count } = await supabase
      .from("sellers")
      .select("id", { count: "exact", head: true });
    totalSellers = count ?? 0;
  } catch { /* ignore */ }

  return NextResponse.json({
    revenueByCategory,
    sellerRankings,
    topProducts,
    summary: {
      totalRevenue: `KES ${Math.round(totalRevenue / 1000)}K`,
      totalOrders,
      totalProducts,
      totalSellers,
    },
  });
}
