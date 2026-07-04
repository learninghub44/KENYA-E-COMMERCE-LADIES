import { createSupabaseClient } from "../supabase/server"

export interface SupportTicket {
  id: string
  ticket_number: number
  user_id: string | null
  user_type: "buyer" | "seller" | "guest"
  full_name: string
  email: string
  subject: string
  description: string
  category: string
  status: "open" | "in_progress" | "waiting_for_customer" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  assigned_to: string | null
  order_number: string | null
  seller_name: string | null
  ai_summary: string | null
  ai_suggested_category: string | null
  ai_suggested_steps: string[] | null
  ai_confidence: number | null
  resolved_at: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string | null
  sender_type: "customer" | "support" | "ai" | "system"
  message: string
  is_internal_note: boolean
  created_at: string
}

export interface CreateTicketInput {
  user_id?: string | null
  user_type: "buyer" | "seller" | "guest"
  full_name: string
  email: string
  subject: string
  description: string
  category: string
  priority?: "low" | "medium" | "high" | "urgent"
  order_number?: string
  seller_name?: string
  ai_summary?: string
  ai_suggested_category?: string
  ai_suggested_steps?: string[]
  ai_confidence?: number
}

export interface TicketFilters {
  status?: string
  category?: string
  assigned_to?: string
  search?: string
  page?: number
  limit?: number
}

export async function createTicket(input: CreateTicketInput) {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      user_id: input.user_id ?? null,
      user_type: input.user_type,
      full_name: input.full_name,
      email: input.email,
      subject: input.subject,
      description: input.description,
      category: input.category,
      priority: input.priority ?? "medium",
      order_number: input.order_number ?? null,
      seller_name: input.seller_name ?? null,
      ai_summary: input.ai_summary ?? null,
      ai_suggested_category: input.ai_suggested_category ?? null,
      ai_suggested_steps: input.ai_suggested_steps ?? null,
      ai_confidence: input.ai_confidence ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating ticket:", error)
    return { ok: false as const, message: error.message }
  }

  return { ok: true as const, data: data as SupportTicket }
}

export async function getTickets(filters: TicketFilters = {}) {
  const supabase = await createSupabaseClient()
  const page = filters.page ?? 1
  const limit = filters.limit ?? 20
  const offset = (page - 1) * limit

  let query = supabase
    .from("support_tickets")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })

  if (filters.status) {
    query = query.eq("status", filters.status)
  }
  if (filters.category) {
    query = query.eq("category", filters.category)
  }
  if (filters.assigned_to) {
    query = query.eq("assigned_to", filters.assigned_to)
  }
  if (filters.search) {
    query = query.or(`subject.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,ticket_number.eq.${filters.search || 0}`)
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching tickets:", error)
    return { ok: false as const, message: error.message }
  }

  return {
    ok: true as const,
    data: data as SupportTicket[],
    total: count ?? 0,
    page,
    limit,
  }
}

export async function getTicketById(ticketId: string) {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("id", ticketId)
    .single()

  if (error) {
    return { ok: false as const, message: error.message }
  }

  return { ok: true as const, data: data as SupportTicket }
}

export async function updateTicket(
  ticketId: string,
  updates: Partial<Pick<SupportTicket, "status" | "assigned_to" | "priority" | "category">>
) {
  const supabase = await createSupabaseClient()

  const updateData: Record<string, unknown> = { ...updates }

  if (updates.status === "resolved") {
    updateData.resolved_at = new Date().toISOString()
  }
  if (updates.status === "closed") {
    updateData.closed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .update(updateData)
    .eq("id", ticketId)
    .select()
    .single()

  if (error) {
    return { ok: false as const, message: error.message }
  }

  return { ok: true as const, data: data as SupportTicket }
}

export async function getTicketMessages(ticketId: string) {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from("ticket_messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true })

  if (error) {
    return { ok: false as const, message: error.message }
  }

  return { ok: true as const, data: data as TicketMessage[] }
}

export async function addTicketMessage(
  ticketId: string,
  message: {
    sender_id?: string | null
    sender_type: "customer" | "support" | "ai" | "system"
    message: string
    is_internal_note?: boolean
  }
) {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from("ticket_messages")
    .insert({
      ticket_id: ticketId,
      sender_id: message.sender_id ?? null,
      sender_type: message.sender_type,
      message: message.message,
      is_internal_note: message.is_internal_note ?? false,
    })
    .select()
    .single()

  if (error) {
    return { ok: false as const, message: error.message }
  }

  return { ok: true as const, data: data as TicketMessage }
}

export async function getTicketStats() {
  const supabase = await createSupabaseClient()

  const [openResult, inProgressResult, resolvedResult, totalResult] = await Promise.all([
    supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "in_progress"),
    supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "resolved"),
    supabase.from("support_tickets").select("id", { count: "exact", head: true }),
  ])

  return {
    open: openResult.count ?? 0,
    inProgress: inProgressResult.count ?? 0,
    resolved: resolvedResult.count ?? 0,
    total: totalResult.count ?? 0,
  }
}
