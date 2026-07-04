"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MessageCircle, X, Send, Loader2, Ticket, Copy, Check } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface TicketForm {
  full_name: string
  email: string
  user_type: "buyer" | "seller" | "guest"
  subject: string
  category: string
  description: string
  order_number: string
  seller_name: string
  priority: "low" | "medium" | "high"
}

const CATEGORIES = [
  { value: "account", label: "Account" },
  { value: "orders", label: "Orders" },
  { value: "products", label: "Products" },
  { value: "seller_verification", label: "Seller Verification" },
  { value: "technical_issue", label: "Technical Issue" },
  { value: "login", label: "Login" },
  { value: "shipping", label: "Shipping" },
  { value: "returns", label: "Returns" },
  { value: "marketplace_policy", label: "Marketplace Policy" },
  { value: "security", label: "Security" },
  { value: "general_question", label: "General Question" },
  { value: "feature_request", label: "Feature Request" },
  { value: "bug_report", label: "Bug Report" },
  { value: "other", label: "Other" },
]

const QUICK_ACTIONS = [
  "How do I place an order?",
  "How do returns work?",
  "How do I contact a seller?",
  "How do I add products?",
  "I forgot my password",
]

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm Zuri Market's AI support assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [ticketForm, setTicketForm] = useState<TicketForm>({
    full_name: "",
    email: "",
    user_type: "buyer",
    subject: "",
    category: "general_question",
    description: "",
    order_number: "",
    seller_name: "",
    priority: "medium",
  })
  const [ticketSuccess, setTicketSuccess] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const sessionIdRef = useRef<string>(crypto.randomUUID())

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }))

      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          sessionId: sessionIdRef.current,
        }),
      })

      if (!res.ok) throw new Error("Failed to get response")

      const data = await res.json()

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again or contact support at hello@zurimarket.co.ke.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleQuickAction = (action: string) => {
    sendMessage(action)
  }

  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          sessionId: sessionIdRef.current,
          createTicket: {
            ...ticketForm,
            description: ticketForm.description || messages.map((m) => `${m.role}: ${m.content}`).join("\n"),
            subject: ticketForm.subject || "Support Request from AI Chat",
          },
        }),
      })

      if (!res.ok) throw new Error("Failed to create ticket")

      const data = await res.json()

      if (data.ticket) {
        setTicketSuccess(data.ticket.ticket_number)
        setShowTicketForm(false)

        const systemMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.content,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, systemMessage])
      }
    } catch {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Failed to create support ticket. Please try again or email us at hello@zurimarket.co.ke.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1C5C56] text-white shadow-lg transition-all hover:bg-[#1C5C56]/90 hover:shadow-xl"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[380px] flex-col rounded-lg border bg-white shadow-2xl" style={{ height: "520px" }}>
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-[#1C5C56] px-4 py-3">
            <div>
              <h3 className="font-semibold text-white">Zuri Market Support</h3>
              <p className="text-xs text-white/80">AI-powered assistance</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-white hover:bg-white/20"
                onClick={() => setShowTicketForm(!showTicketForm)}
              >
                <Ticket className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Ticket Form Overlay */}
          {showTicketForm && (
            <div className="absolute inset-0 z-10 flex flex-col bg-white">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h4 className="font-semibold">Create Support Ticket</h4>
                <Button variant="ghost" size="sm" onClick={() => setShowTicketForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={handleCreateTicket} className="flex-1 overflow-y-auto p-4 space-y-3">
                <Input
                  placeholder="Full Name *"
                  value={ticketForm.full_name}
                  onChange={(e) => setTicketForm({ ...ticketForm, full_name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Email *"
                  type="email"
                  value={ticketForm.email}
                  onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                  required
                />
                <select
                  value={ticketForm.user_type}
                  onChange={(e) => setTicketForm({ ...ticketForm, user_type: e.target.value as TicketForm["user_type"] })}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="guest">Guest</option>
                </select>
                <Input
                  placeholder="Subject *"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  required
                />
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <Textarea
                  placeholder="Describe your issue..."
                  rows={3}
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                />
                <Input
                  placeholder="Order Number (optional)"
                  value={ticketForm.order_number}
                  onChange={(e) => setTicketForm({ ...ticketForm, order_number: e.target.value })}
                />
                <Input
                  placeholder="Seller Name (optional)"
                  value={ticketForm.seller_name}
                  onChange={(e) => setTicketForm({ ...ticketForm, seller_name: e.target.value })}
                />
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value as TicketForm["priority"] })}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Submit Ticket
                </Button>
              </form>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {ticketSuccess && (
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  Ticket #{ticketSuccess} created
                </Badge>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`group relative max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-[#1C5C56] text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="absolute -right-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-gray-100 px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="border-t px-4 py-2">
              <p className="mb-2 text-xs text-gray-500">Quick actions:</p>
              <div className="flex flex-wrap gap-1">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    className="rounded-full border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t p-3">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                rows={1}
                className="min-h-[40px] max-h-[100px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
