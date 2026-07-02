import { NextRequest, NextResponse } from "next/server";
import { createEventService } from "../../../lib/events/event-service";
import { createEventRepository, EventsDbClient } from "../../../lib/events/event-repository";
import { createSupabaseClient } from "../../../lib/supabase/server";

async function checkPrivilegedAccess(supabase: Awaited<ReturnType<typeof createSupabaseClient>>): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = (data as Array<{ role: string }> | null)?.map((r) => r.role) ?? [];
  return roles.some((r) => r === "admin" || r === "super_admin");
}

async function getService() {
  const supabase = await createSupabaseClient();
  const repository = createEventRepository(supabase as unknown as EventsDbClient);
  return { service: createEventService({ repository }), supabase };
}

export async function POST(request: NextRequest) {
  try {
    const { service, supabase } = await getService();
    const allowed = await checkPrivilegedAccess(supabase);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const event = await service.createEvent(body);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { service, supabase } = await getService();
    const allowed = await checkPrivilegedAccess(supabase);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      eventTypes: searchParams.get("eventTypes")?.split(",") ?? undefined,
      userId: searchParams.get("userId") ?? undefined,
      sellerId: searchParams.get("sellerId") ?? undefined,
      sessionId: searchParams.get("sessionId") ?? undefined,
      entityType: searchParams.get("entityType") ?? undefined,
      entityId: searchParams.get("entityId") ?? undefined,
      source: searchParams.get("source") ?? undefined,
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
    };

    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const result = await service.listEvents(
      Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined)) as any,
      cursor,
      limit,
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
