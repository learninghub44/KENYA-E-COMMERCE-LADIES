import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../../lib/supabase/server";
import { authorizeRoute } from "../../../../../middleware/auth-guard";
import type { AppRole } from "../../../../../types/roles";

async function requireAdmin() {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = (roleRows ?? []).map((row: { role: AppRole }) => row.role);
  const auth = authorizeRoute({ authLevel: "admin", roles, permissions: "admin.moderate" });
  if (!auth.allowed) return { ok: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };

  return { ok: true as const, userId: user.id, supabase };
}

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { data, error } = await guard.supabase
    .from("review_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data ?? []).map((row) => ({
    id: row.id as string,
    reviewId: row.review_id as string,
    reviewType: row.review_type as string,
    reporterId: row.reporter_id as string,
    reason: (row.reason as string) ?? "other",
    status: (row.status as string) ?? "open",
    createdAt: row.created_at as string
  }));

  return NextResponse.json({ items, nextCursor: null });
}

export async function PATCH(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = await request.json();
  const { reportId, action } = body as { reportId?: string; action?: "dismiss" | "resolve" };
  if (!reportId || !action) return NextResponse.json({ error: "reportId and action required" }, { status: 400 });

  const status = action === "dismiss" ? "dismissed" : "resolved";
  const { data, error } = await guard.supabase
    .from("review_reports")
    .update({ status, resolved_at: new Date().toISOString() })
    .eq("id", reportId)
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? "Report not found" }, { status: 404 });

  await guard.supabase.from("audit_logs").insert({
    actor_id: guard.userId,
    action: action === "dismiss" ? "review_report.dismissed" : "review_report.resolved",
    entity_type: "report",
    entity_id: reportId,
    new_values: { status }
  });

  return NextResponse.json({
    id: data.id,
    reviewId: data.review_id,
    reviewType: data.review_type,
    reporterId: data.reporter_id,
    reason: data.reason,
    status: data.status,
    createdAt: data.created_at
  });
}
