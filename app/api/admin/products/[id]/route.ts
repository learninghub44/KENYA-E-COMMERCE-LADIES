import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../../lib/supabase/server";
import { authorizeRoute } from "../../../../../middleware/auth-guard";
import type { AppRole } from "../../../../../types/roles";

type PatchAction = "approve" | "reject" | "feature" | "unfeature" | "archive";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = (roleRows ?? []).map((row: { role: AppRole }) => row.role);
  const auth = authorizeRoute({ authLevel: "admin", roles });
  if (!auth.allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const action: PatchAction | undefined = body.action;

  if (!action) {
    return NextResponse.json({ error: "action is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  switch (action) {
    case "approve":
      updates.status = "active";
      updates.published_at = new Date().toISOString();
      break;
    case "reject":
      updates.status = "rejected";
      break;
    case "feature":
      updates.is_featured = true;
      break;
    case "unfeature":
      updates.is_featured = false;
      break;
    case "archive":
      updates.status = "archived";
      break;
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const { data: product, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  return NextResponse.json({ product });
}
