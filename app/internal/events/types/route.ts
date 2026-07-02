import { NextRequest, NextResponse } from "next/server";
import { createEventService } from "../../../../lib/events/event-service";
import { createEventRepository, EventsDbClient } from "../../../../lib/events/event-repository";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import { EVENT_TYPES } from "../../../../lib/events/types";

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const roles = (data as Array<{ role: string }> | null)?.map((r) => r.role) ?? [];
    if (!roles.some((r) => r === "admin" || r === "super_admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const definedTypes = Object.values(EVENT_TYPES);
    const repository = createEventRepository(supabase as unknown as EventsDbClient);
    const service = createEventService({ repository });
    const usedTypes = await service.listEventTypes();

    return NextResponse.json({
      defined: definedTypes,
      used: usedTypes,
      total: definedTypes.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
