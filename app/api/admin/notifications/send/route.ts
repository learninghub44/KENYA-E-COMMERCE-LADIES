import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../../lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseClient();
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
      { error: error instanceof Error ? error.message : "Failed to send notification" },
      { status: 500 },
    );
  }
}
