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
  const rating = searchParams.get("rating") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 10));
  const offset = (page - 1) * limit;

  let query = supabase
    .from("product_reviews")
    .select("*, products(name), profiles(display_name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (rating) {
    query = query.eq("rating", Number(rating));
  }

  const { data: reviews, count, error } = await query.range(offset, offset + limit - 1);
  if (error) return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });

  return NextResponse.json({
    reviews: reviews ?? [],
    total: count ?? 0,
    page,
    limit,
  });
}
