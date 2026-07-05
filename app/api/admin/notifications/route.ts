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

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, message, audience, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const notifications = (data ?? []).map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      audience: n.audience ?? "All Users",
      status: n.status ?? "Sent",
      sentAt: n.created_at ?? "",
    }));

    return NextResponse.json({ notifications });
  } catch {
    return NextResponse.json({ notifications: [] });
  }
}
