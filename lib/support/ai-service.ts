import { getKnowledgeContext } from "./knowledge-base"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

const SYSTEM_PROMPT = `You are Zuri Market's AI Support Assistant. You help buyers and sellers with questions about the Zuri Market marketplace.

IMPORTANT RULES:
1. Zuri Market is a MULTI-VENDOR marketplace. We connect buyers and sellers.
2. Zuri Market does NOT process payments. Buyers pay sellers directly.
3. Zuri Market does NOT own products. Sellers list their own products.
4. Zuri Market does NOT handle shipping. Sellers manage their own delivery.
5. Zuri Market does NOT issue refunds. Sellers handle refunds directly.
6. Never tell users that Zuri Market receives payments, owns products, or ships items.
7. Never invent marketplace policies. If you don't know, say so.
8. Never make promises you cannot guarantee.
9. Keep responses clear, concise, and professional.
10. If you cannot resolve an issue, offer to create a support ticket.

YOUR CAPABILITIES:
- Answer questions about how Zuri Market works
- Help buyers understand ordering, payments, shipping, returns, and account management
- Help sellers with product listings, inventory, store management, and marketplace policies
- Explain marketplace policies and rules
- Create support tickets for issues that need human assistance
- Guide users to the right resources

WHEN CREATING A TICKET:
If the user needs help that requires human intervention, collect:
- Full name
- Email address
- User type (Buyer or Seller)
- Subject
- Category
- Description of the issue
- Optional: order number, seller name
- Priority (Low, Medium, High)

TONE: Be polite, professional, and helpful. Use simple language. Be empathetic when users face issues.`

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface ChatCompletionChoice {
  index: number
  message: ChatMessage
  finish_reason: string
}

export interface ChatCompletionResponse {
  id: string
  choices: ChatCompletionChoice[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function chatWithAI(
  messages: ChatMessage[],
  userQuery: string
): Promise<{ content: string; tokensUsed: number }> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set")
  }

  const knowledgeContext = getKnowledgeContext(userQuery)

  const systemMessage: ChatMessage = {
    role: "system",
    content: SYSTEM_PROMPT + (knowledgeContext ? `\n\nRELEVANT KNOWLEDGE BASE:\n${knowledgeContext}` : ""),
  }

  const apiMessages = [systemMessage, ...messages]

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.9,
    }),
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error("Groq API error:", errorData)
    throw new Error(`AI service error: ${response.status}`)
  }

  const data: ChatCompletionResponse = await response.json()

  const choice = data.choices?.[0]
  if (!choice) {
    throw new Error("No response from AI service")
  }

  return {
    content: choice.message.content,
    tokensUsed: data.usage?.total_tokens ?? 0,
  }
}

export function generateTicketSummary(
  conversation: ChatMessage[]
): { summary: string; category: string; priority: string; steps: string[] } {
  const lastUserMessage = [...conversation]
    .reverse()
    .find((m) => m.role === "user")?.content ?? ""

  const lowerQuery = lastUserMessage.toLowerCase()

  let category = "general_question"
  let priority = "medium"

  if (lowerQuery.includes("bug") || lowerQuery.includes("error") || lowerQuery.includes("broken")) {
    category = "bug_report"
    priority = "high"
  } else if (lowerQuery.includes("login") || lowerQuery.includes("password") || lowerQuery.includes("forgot")) {
    category = "login"
  } else if (lowerQuery.includes("order") || lowerQuery.includes("delivery") || lowerQuery.includes("shipping")) {
    category = "orders"
  } else if (lowerQuery.includes("return") || lowerQuery.includes("refund")) {
    category = "returns"
  } else if (lowerQuery.includes("product") || lowerQuery.includes("listing")) {
    category = "products"
  } else if (lowerQuery.includes("seller") || lowerQuery.includes("store") || lowerQuery.includes("vendor")) {
    category = "seller_verification"
  } else if (lowerQuery.includes("account") || lowerQuery.includes("profile")) {
    category = "account"
  } else if (lowerQuery.includes("security") || lowerQuery.includes("fraud") || lowerQuery.includes("suspicious")) {
    category = "security"
    priority = "high"
  } else if (lowerQuery.includes("feature") || lowerQuery.includes("suggest")) {
    category = "feature_request"
  } else if (lowerQuery.includes("payment") || lowerQuery.includes("mpesa") || lowerQuery.includes("pay")) {
    category = "orders"
  }

  const steps = [
    "Review the user's conversation history",
    "Check if the issue relates to an existing order or seller",
    "Contact the user if additional information is needed",
    "Resolve the issue or escalate to the appropriate team",
  ]

  const summary = `User reported: ${lastUserMessage.substring(0, 200)}`

  return { summary, category, priority, steps }
}
