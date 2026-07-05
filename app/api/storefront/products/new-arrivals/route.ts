import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../../lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "24");
    const offset = (page - 1) * limit;

    const supabase = await createSupabaseClient();
    const { data, count } = await supabase.from("products").select("id, name, slug, price, compare_price, rating_avg, review_count, is_new, images:product_images(url, alt_text), seller:sellers(store_name, slug), category:categories(name, slug)", { count: "exact" }).eq("status", "active").eq("is_new", true).order("created_at", { ascending: false }).range(offset, offset + limit - 1);

    return NextResponse.json({ products: data ?? [], total: count ?? 0, page, limit });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
