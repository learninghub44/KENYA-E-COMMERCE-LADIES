import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import { authorizeRoute } from "../../../../middleware/auth-guard";
import type { AppRole } from "../../../../types/roles";

export async function PATCH(request: Request) {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = (roleRows ?? []).map((row: { role: AppRole }) => row.role);
  const auth = authorizeRoute({ authLevel: "admin", roles });
  if (!auth.allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { userId, action } = body;

  if (!userId || !action) {
    return NextResponse.json({ error: "userId and action required" }, { status: 400 });
  }

  switch (action) {
    case "suspend": {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "suspended" })
        .eq("id", userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }
    case "ban": {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "deleted" })
        .eq("id", userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }
    case "unsuspend": {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "active" })
        .eq("id", userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }
    case "promote-seller": {
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role: "seller", granted_by: user.id }, { onConflict: "user_id, role" });
      if (roleError) return NextResponse.json({ error: roleError.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }
    case "make-admin": {
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role: "admin", granted_by: user.id }, { onConflict: "user_id, role" });
      if (roleError) return NextResponse.json({ error: roleError.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
