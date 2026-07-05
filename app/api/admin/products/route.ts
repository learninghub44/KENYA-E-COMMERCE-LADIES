import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import { authorizeRoute } from "../../../../middleware/auth-guard";
import type { AppRole } from "../../../../types/roles";

export async function GET(request: Request) {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = (roleRows ?? []).map((row: { role: AppRole }) => row.role);
  const auth = authorizeRoute({ authLevel: "admin", roles });
  if (!auth.allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 10));
  const offset = (page - 1) * limit;

  let query = supabase
    .from("products")
    .select("*, product_images(url, is_primary), sellers(store_name), inventory_items(quantity_available, quantity_reserved)", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq("status", status);
  }

  const { data: products, count, error } = await query.range(offset, offset + limit - 1);
  if (error) return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });

  return NextResponse.json({
    products: products ?? [],
    total: count ?? 0,
    page,
    limit,
  });
}
