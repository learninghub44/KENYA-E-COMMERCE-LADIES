import { NextRequest, NextResponse } from "next/server"
import { createSupabaseClient } from "../../../../lib/supabase/server"
import { getTickets, getTicketStats } from "../../../../lib/support/ticket-service"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin or support
    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)

    const roles = (roleRows ?? []).map((r: { role: string }) => r)
    const isAdmin = roles.some((r) => r.role === "admin" || r.role === "super_admin" || r.role === "support")

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const filters = {
      status: searchParams.get("status") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      assigned_to: searchParams.get("assigned_to") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: parseInt(searchParams.get("page") ?? "1"),
      limit: parseInt(searchParams.get("limit") ?? "20"),
    }

    const [ticketsResult, statsResult] = await Promise.all([
      getTickets(filters),
      getTicketStats(),
    ])

    if (!ticketsResult.ok) {
      return NextResponse.json({ error: ticketsResult.message }, { status: 500 })
    }

    return NextResponse.json({
      tickets: ticketsResult.data,
      total: ticketsResult.total,
      page: ticketsResult.page,
      limit: ticketsResult.limit,
      stats: statsResult,
    })
  } catch (error) {
    console.error("Tickets API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
