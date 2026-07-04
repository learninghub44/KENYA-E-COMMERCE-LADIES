"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Search,
  Send,
  MessageSquare,
  CheckCheck,
  Loader2,
} from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Avatar, AvatarFallback } from "../../../components/ui/avatar"
import { Card, CardContent } from "../../../components/ui/card"
import { cn } from "../../../lib/utils"

interface ConversationItem {
  id: string
  otherParty: { name: string; avatar: string | null }
  lastMessage: string | null
  lastMessageAt: string
  unread: number
  isBuyer: boolean
  status: string
  productId: string | null
  orderId: string | null
  createdAt: string
}

interface ChatMessage {
  id: string
  senderId: string
  body: string | null
  createdAt: string
  readAt: string | null
  deletedAt: string | null
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [reply, setReply] = useState("")
  const [search, setSearch] = useState("")
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConvs(true)
      const res = await fetch("/api/messaging/conversations?role=seller")
      if (!res.ok) throw new Error("Failed to load conversations")
      const data = await res.json()
      setConversations(data.items ?? [])
    } catch {
      setConversations([])
    } finally {
      setLoadingConvs(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    fetch("/api/messaging/conversations")
      .then((r) => r.json())
      .then(() => {})
      .catch(() => {})
  }, [])

  const fetchMessages = useCallback(async (convId: string) => {
    try {
      setLoadingMessages(true)
      const res = await fetch(`/api/messaging/conversations/${convId}/messages?limit=50`)
      if (!res.ok) throw new Error("Failed to load messages")
      const data = await res.json()
      setMessages(data.items ?? [])
    } catch {
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId)
    }
  }, [selectedId, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user?.id) setCurrentUserId(d.user.id)
      })
      .catch(() => {})
  }, [])

  function handleSend() {
    if (!reply.trim() || !selectedId || sending) return
    const body = reply.trim()
    setReply("")
    setSending(true)

    fetch(`/api/messaging/conversations/${selectedId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Send failed")
        return r.json()
      })
      .then((msg) => {
        setMessages((prev) => [...prev, msg])
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedId
              ? { ...c, lastMessage: body, lastMessageAt: new Date().toISOString() }
              : c
          )
        )
      })
      .catch(() => {
        setReply(body)
      })
      .finally(() => setSending(false))
  }

  function formatTime(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return "Just now"
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    const diffDay = Math.floor(diffHr / 24)
    if (diffDay < 7) return `${diffDay}d ago`
    return d.toLocaleDateString()
  }

  const filtered = conversations.filter(
    (c) =>
      c.otherParty.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.lastMessage ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const activeConversation = conversations.find((c) => c.id === selectedId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Communicate with your buyers directly
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="flex h-[600px] divide-x">
          <div className="flex w-80 flex-col bg-white">
            <div className="border-b p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No conversations found
                </div>
              ) : (
                filtered.map((conv) => (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setSelectedId(conv.id)}
                    className={cn(
                      "flex w-full gap-3 border-b p-3 text-left transition-colors hover:bg-accent/50",
                      selectedId === conv.id && "bg-accent/80"
                    )}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {conv.otherParty.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm font-medium">
                          {conv.otherParty.name}
                        </span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground mt-0.5">
                        {conv.lastMessage ?? "No messages yet"}
                      </p>
                    </div>
                    {conv.unread > 0 && (
                      <div className="mt-1.5 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-white">
                        {conv.unread}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col bg-muted/20">
            {activeConversation ? (
              <>
                <div className="flex items-center gap-3 border-b bg-white p-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {activeConversation.otherParty.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">
                      {activeConversation.otherParty.name}
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-sm text-muted-foreground">
                        No messages yet. Say hello!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine = currentUserId
                        ? msg.senderId === currentUserId
                        : false
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex",
                            isMine ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] rounded-xl px-4 py-2.5 text-sm shadow-sm",
                              isMine
                                ? "bg-[#341327] text-white rounded-tr-none"
                                : "bg-white text-foreground border rounded-tl-none"
                            )}
                          >
                            <p className="leading-relaxed">{msg.body}</p>
                            <div
                              className={cn(
                                "mt-1 flex items-center justify-end gap-1 text-[9px]",
                                isMine
                                  ? "text-white/70"
                                  : "text-muted-foreground"
                              )}
                            >
                              <span>{formatTime(msg.createdAt)}</span>
                              {isMine && (
                                <CheckCheck
                                  className={cn(
                                    "h-3 w-3",
                                    msg.readAt ? "text-blue-300" : "text-white/50"
                                  )}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t bg-white p-3">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your reply..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSend()
                        }
                      }}
                      className="min-h-[44px] resize-none"
                      rows={1}
                    />
                    <Button
                      size="icon"
                      onClick={handleSend}
                      disabled={!reply.trim() || sending}
                      className="shrink-0 rounded-full h-10 w-10 bg-[#1C5C56] hover:bg-[#1C5C56]/90"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="mx-auto mb-2 h-12 w-12 text-muted-foreground/60" />
                  <p className="text-sm text-muted-foreground">
                    Select a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
