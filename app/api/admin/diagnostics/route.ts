import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseClient();
  const now = new Date().toISOString();

  const dbStart = Date.now();
  let dbOk = true;
  let profileCount = 0;
  try {
    const { count, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });
    if (error) throw error;
    profileCount = count ?? 0;
  } catch {
    dbOk = false;
  }
  const dbLatency = Date.now() - dbStart;

  let productCount = 0;
  try {
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true });
    productCount = count ?? 0;
  } catch {
    // Products table may not exist
  }

  let orderCount = 0;
  try {
    const { count } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true });
    orderCount = count ?? 0;
  } catch {
    // Orders table may not exist
  }

  let sellerCount = 0;
  try {
    const { count } = await supabase
      .from("sellers")
      .select("id", { count: "exact", head: true });
    sellerCount = count ?? 0;
  } catch {
    // Sellers table may not exist
  }

  return NextResponse.json({
    environment: {
      "Node Version": process.version,
      "Platform": `${process.platform} ${process.arch}`,
      "Memory": `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB used`,
      "Uptime": `${Math.floor(process.uptime() / 86400)}d ${Math.floor((process.uptime() % 86400) / 3600)}h`,
    },
    database: {
      status: dbOk ? "healthy" : "critical",
      latencyMs: dbLatency,
      profileCount,
      productCount,
      orderCount,
      sellerCount,
    },
    generatedAt: now,
  });
}
