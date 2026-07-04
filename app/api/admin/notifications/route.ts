import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseClient();

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
