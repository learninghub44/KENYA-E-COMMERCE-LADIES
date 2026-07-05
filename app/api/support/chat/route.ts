import { NextRequest, NextResponse } from "next/server"
import { createSupabaseClient } from "../../../../lib/supabase/server"
import { chatWithAI, generateTicketSummary, type ChatMessage } from "../../../../lib/support/ai-service"
import { createTicket } from "../../../../lib/support/ticket-service"

interface ChatRequest {
  messages: ChatMessage[]
  sessionId: string
  createTicket?: {
    full_name: string
    email: string
    user_type: "buyer" | "seller" | "guest"
    subject: string
    category: string
    description: string
    order_number?: string
    seller_name?: string
    priority?: "low" | "medium" | "high" | "urgent"
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { messages, sessionId, createTicket: ticketInput } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 })
    }

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const supabase = await createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Store user message
    const lastUserMessage = messages.filter((m) => m.role === "user").pop()
    if (lastUserMessage) {
      await supabase.from("ai_conversations").insert({
        user_id: user?.id ?? null,
        session_id: sessionId,
        role: "user",
        content: lastUserMessage.content,
      })
    }

    // Create ticket if requested
    if (ticketInput) {
      const ticketResult = await createTicket({
        user_id: user?.id ?? null,
        user_type: ticketInput.user_type,
        full_name: ticketInput.full_name,
        email: ticketInput.email,
        subject: ticketInput.subject,
        description: ticketInput.description,
        category: ticketInput.category,
        priority: ticketInput.priority ?? "medium",
        order_number: ticketInput.order_number,
        seller_name: ticketInput.seller_name,
        ai_summary: generateTicketSummary(messages).summary,
        ai_suggested_category: generateTicketSummary(messages).category,
        ai_suggested_steps: generateTicketSummary(messages).steps,
      })

      if (ticketResult.ok) {
        // Add system message about ticket creation
        await supabase.from("ai_conversations").insert({
          user_id: user?.id ?? null,
          session_id: sessionId,
          role: "assistant",
          content: `I've created support ticket #${ticketResult.data.ticket_number} for you. Our support team will review your issue and get back to you soon. In the meantime, is there anything else I can help you with?`,
        })

        return NextResponse.json({
          content: `I've created support ticket #${ticketResult.data.ticket_number} for you. Our support team will review your issue and get back to you soon. In the meantime, is there anything else I can help you with?`,
          ticket: ticketResult.data,
        })
      }
    }

    // Get AI response
    const aiResponse = await chatWithAI(messages, lastUserMessage?.content ?? "")

    // Store AI response
    await supabase.from("ai_conversations").insert({
      user_id: user?.id ?? null,
      session_id: sessionId,
      role: "assistant",
      content: aiResponse.content,
      tokens_used: aiResponse.tokensUsed,
    })

    return NextResponse.json({
      content: aiResponse.content,
      tokensUsed: aiResponse.tokensUsed,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
