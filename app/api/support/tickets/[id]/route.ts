import { NextRequest, NextResponse } from "next/server"
import { createSupabaseClient } from "../../../../../lib/supabase/server"
import { getTicketById, updateTicket, getTicketMessages, addTicketMessage } from "../../../../../lib/support/ticket-service"

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const ticketResult = await getTicketById(id)
    if (!ticketResult.ok) {
      return NextResponse.json({ error: ticketResult.message }, { status: 404 })
    }

    // Check access: user owns ticket or is admin/support
    const ticket = ticketResult.data
    if (ticket.user_id && ticket.user_id !== user.id) {
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)

      const roles = (roleRows ?? []).map((r: { role: string }) => r.role)
      const isAdmin = roles.some((r) => ["admin", "super_admin", "support"].includes(r))

      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const messagesResult = await getTicketMessages(id)

    return NextResponse.json({
      ticket,
      messages: messagesResult.ok ? messagesResult.data : [],
    })
  } catch (error) {
    console.error("Ticket detail API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admin/support can update tickets
    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)

    const roles = (roleRows ?? []).map((r: { role: string }) => r.role)
    const isAdmin = roles.some((r) => ["admin", "super_admin", "support"].includes(r))

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { status, assigned_to, priority, category, message } = body

    const updates: Record<string, unknown> = {}
    if (status) updates.status = status
    if (assigned_to !== undefined) updates.assigned_to = assigned_to
    if (priority) updates.priority = priority
    if (category) updates.category = category

    const updateResult = await updateTicket(id, updates)
    if (!updateResult.ok) {
      return NextResponse.json({ error: updateResult.message }, { status: 500 })
    }

    // Add support message if provided
    if (message) {
      await addTicketMessage(id, {
        sender_id: user.id,
        sender_type: "support",
        message,
      })
    }

    return NextResponse.json({ ticket: updateResult.data })
  } catch (error) {
    console.error("Ticket update API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
