import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import { authorizeRoute } from "../../../../middleware/auth-guard";
import type { AppRole } from "../../../../types/roles";

export async function GET() {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = (roleRows ?? []).map((row: { role: AppRole }) => row.role);
  const auth = authorizeRoute({ authLevel: "admin", roles });
  if (!auth.allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [
    ordersResult,
    productsResult,
    profilesResult,
    recentOrdersResult,
  ] = await Promise.all([
    supabase.from("orders").select("total_minor, payment_status, status, created_at"),
    supabase.from("products").select("id, category_id, categories(name)"),
    supabase.from("profiles").select("created_at"),
    supabase.from("orders").select("id, total_minor, status, payment_status, created_at, profiles(full_name), sellers(store_name)").order("created_at", { ascending: false }).limit(10),
  ]);

  const orders = ordersResult.data ?? [];
  const products = productsResult.data ?? [];
  const profiles = profilesResult.data ?? [];
  const recentOrders = recentOrdersResult.data ?? [];

  const paidOrders = orders.filter(o => o.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total_minor ?? 0), 0);

  const ordersByStatus: Record<string, number> = {};
  for (const o of orders) {
    const s = o.status ?? "unknown";
    ordersByStatus[s] = (ordersByStatus[s] ?? 0) + 1;
  }

  const categoryMap: Record<string, number> = {};
  for (const p of products) {
    const cats = p.categories as { name: string }[] | null;
    const catName = cats?.[0]?.name ?? "Uncategorized";
    categoryMap[catName] = (categoryMap[catName] ?? 0) + 1;
  }

  const userGrowthMap: Record<string, number> = {};
  for (const p of profiles) {
    if (!p.created_at) continue;
    const d = new Date(p.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    userGrowthMap[key] = (userGrowthMap[key] ?? 0) + 1;
  }

  const now = new Date();
  const revenueByDay: Record<string, number> = {};
  for (const o of paidOrders) {
    if (!o.created_at) continue;
    const d = new Date(o.created_at);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) {
      const key = d.toLocaleDateString("en-KE", { month: "short", day: "numeric" });
      revenueByDay[key] = (revenueByDay[key] ?? 0) + o.total_minor;
    }
  }

  const revenueOverTime = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const key = date.toLocaleDateString("en-KE", { month: "short", day: "numeric" });
    return { date: key, revenue: revenueByDay[key] ?? 0 };
  });

  const categoryData = Object.entries(categoryMap)
    .map(([name, count]) => ({ name, revenue: count }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const userGrowthData = Object.entries(userGrowthMap)
    .map(([month, users]) => ({ month, users }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);

  const ordersByStatusArray = Object.entries(ordersByStatus).map(([name, value]) => ({
    name,
    value,
    color: name === "delivered" ? "hsl(var(--primary))"
      : name === "processing" ? "#f59e0b"
      : name === "shipped" ? "#3b82f6"
      : name === "pending" ? "#8b5cf6"
      : "#ef4444",
  }));

  const averageOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;
  const conversionRate = profiles.length > 0 ? ((orders.length / profiles.length) * 100).toFixed(1) : "0";

  return NextResponse.json({
    metrics: {
      revenue: totalRevenue,
      orders: orders.length,
      averageOrderValue,
      conversionRate: `${conversionRate}%`,
      activeUsers: profiles.length,
    },
    revenueOverTime,
    ordersByStatus: ordersByStatusArray,
    categoryData,
    userGrowthData,
    recentOrders,
  });
}
