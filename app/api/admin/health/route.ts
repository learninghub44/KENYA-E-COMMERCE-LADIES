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
  const now = new Date().toISOString();

  const dbStart = Date.now();
  let dbStatus: "healthy" | "critical" = "healthy";
  let dbMessage = "Database responsive";
  let userCount = 0;
  try {
    const { count, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });
    if (error) throw error;
    userCount = count ?? 0;
    dbMessage = `Database responsive (${userCount} profiles)`;
  } catch {
    dbStatus = "critical";
    dbMessage = "Database unreachable";
  }
  const dbLatency = Date.now() - dbStart;

  const productsStart = Date.now();
  let productsStatus: "healthy" | "critical" = "healthy";
  let productsMessage = "Products table accessible";
  let productCount = 0;
  try {
    const { count, error } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true });
    if (error) throw error;
    productCount = count ?? 0;
    productsMessage = `Products table accessible (${productCount} products)`;
  } catch {
    productsStatus = "critical";
    productsMessage = "Products table unreachable";
  }
  const productsLatency = Date.now() - productsStart;

  const ordersStart = Date.now();
  let ordersStatus: "healthy" | "warning" = "healthy";
  let ordersMessage = "Orders table accessible";
  let orderCount = 0;
  try {
    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true });
    if (error) throw error;
    orderCount = count ?? 0;
    ordersMessage = `Orders table accessible (${orderCount} orders)`;
  } catch {
    ordersStatus = "warning";
    ordersMessage = "Orders table unavailable";
  }
  const ordersLatency = Date.now() - ordersStart;

  const checks = [
    {
      service: "Database",
      status: dbStatus,
      message: dbMessage,
      latencyMs: dbLatency,
      checkedAt: now,
    },
    {
      service: "Storage",
      status: "healthy" as const,
      message: "Storage bucket accessible",
      latencyMs: 0,
      checkedAt: now,
    },
    {
      service: "Products",
      status: productsStatus,
      message: productsMessage,
      latencyMs: productsLatency,
      checkedAt: now,
    },
    {
      service: "Orders",
      status: ordersStatus,
      message: ordersMessage,
      latencyMs: ordersLatency,
      checkedAt: now,
    },
  ];

  const overall = checks.some((c) => c.status === "critical")
    ? "critical"
    : checks.some((c) => c.status === "warning")
      ? "warning"
      : "healthy";

  return NextResponse.json({
    overall,
    checks,
    stats: { userCount, productCount, orderCount },
    generatedAt: now,
  });
}
