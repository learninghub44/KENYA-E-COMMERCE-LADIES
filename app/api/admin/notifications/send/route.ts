import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../../lib/supabase/server";
import { authorizeRoute } from "../../../../../middleware/auth-guard";
import type { AppRole } from "../../../../../types/roles";

export async function POST(request: Request) {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = (roleRows ?? []).map((row: { role: AppRole }) => row.role);
  const auth = authorizeRoute({ authLevel: "admin", roles });
  if (!auth.allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  const { title, message, audience } = body;

  if (!title || !message) {
    return NextResponse.json(
      { error: "Title and message are required" },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        title,
        message,
        audience: audience ?? "All Users",
        status: "Sent",
      })
      .select("id, title, message, audience, status, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({
      notification: {
        id: data.id,
        title: data.title,
        message: data.message,
        audience: data.audience ?? "All Users",
        status: data.status ?? "Sent",
        sentAt: data.created_at ?? new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 },
    );
  }
}
