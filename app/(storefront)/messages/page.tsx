"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Search,
  Send,
  Plus,
  ChevronLeft,
  MessageSquare,
  AlertCircle,
} from "lucide-react"

import { cn } from "../../../lib/utils"
import { createSupabaseBrowserClient } from "../../../lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Badge } from "../../../components/ui/badge"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { Textarea } from "../../../components/ui/textarea"
import { Breadcrumbs } from "../../../components/shared/breadcrumbs"
import { useAuth } from "../../../lib/auth/auth-context"

interface Message {
  id: string
  senderId: string
  body: string
  createdAt: string
  isMe: boolean
  senderName?: string
}

interface Conversation {
  id: string
  otherParty: {
    name: string
    avatar: string | null
  }
  lastMessage: string
  lastMessageAt: string
  unread: number
  isBuyer: boolean
  status: string
  productId: string | null
  orderId: string | null
  createdAt: string
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return d.toLocaleDateString("en-KE", { weekday: "short" })
  return d.toLocaleDateString("en-KE", { month: "short", day: "numeric" })
}

function MessagesPageInner() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const deepLinkId = searchParams.get("conversationId")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(deepLinkId)
  const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [messageInput, setMessageInput] = useState("")
  const [showMobileList, setShowMobileList] = useState(!deepLinkId)
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabaseRef = useRef(createSupabaseBrowserClient())

  useEffect(() => {
    fetchConversations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId)
    }
  }, [selectedId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Realtime: refresh the conversation list whenever any conversation the
  // user can see changes (new message, unread count, etc). RLS scopes rows
  // to the current user, so no manual filter is needed here.
  useEffect(() => {
    const channel = supabaseRef.current
      .channel("conversations-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => {
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      supabaseRef.current.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Realtime: subscribe to new messages in the open conversation so replies
  // show up without a manual reload.
  useEffect(() => {
    if (!selectedId) return

    const channel: RealtimeChannel = supabaseRef.current
      .channel(`conversation-${selectedId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedId}` },
        (payload) => {
          const row = payload.new as { id: string; sender_id: string; body: string | null; created_at: string }
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev
            return [
              ...prev,
              {
                id: row.id,
                senderId: row.sender_id,
                body: row.body ?? "",
                createdAt: row.created_at,
                isMe: row.sender_id === user?.id,
              },
            ]
          })
        }
      )
      .subscribe()

    return () => {
      supabaseRef.current.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, user?.id])

  const fetchConversations = async () => {
    setConversationsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/messaging/conversations")
      if (!res.ok) throw new Error("Failed to load conversations")
      const data = await res.json()
      const items: Conversation[] = data.items ?? []
      setConversations(items)
      const first = items[0]
      if (first && !selectedId) {
        setSelectedId(first.id)
        setShowMobileList(false)
      } else if (deepLinkId) {
        setShowMobileList(false)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load conversations")
    } finally {
      setConversationsLoading(false)
    }
  }

  const fetchMessages = async (convId: string) => {
    setMessagesLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/messaging/conversations/${convId}/messages`)
      if (!res.ok) throw new Error("Failed to load messages")
      const data = await res.json()
      const items = (data.items ?? []) as Array<{
        id: string
        senderId: string
        body: string | null
        createdAt: string
      }>
      setMessages(
        items.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          body: m.body ?? "",
          createdAt: m.createdAt,
          isMe: m.senderId === user?.id,
        }))
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load messages")
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedId || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/messaging/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: messageInput.trim() }),
      })
      if (!res.ok) throw new Error("Failed to send message")
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        {
          id: data.id,
          senderId: data.senderId,
          body: data.body ?? "",
          createdAt: data.createdAt,
          isMe: true,
        },
      ])
      setMessageInput("")
      fetchConversations()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const selectedConversation = conversations.find((c) => c.id === selectedId)

  const filteredConversations = conversations.filter((c) =>
    c.otherParty.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Messages" },
        ]}
      />

      <h1 className="mb-6 text-2xl font-bold tracking-tight">Messages</h1>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setError(null)}>Dismiss</Button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border">
        <div className="flex h-[600px]">
          <div
            className={cn(
              "w-full border-r sm:w-80 md:w-96",
              !showMobileList && "hidden sm:flex sm:flex-col"
            )}
          >
            <div className="border-b p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => {}}>
                <Plus className="mr-2 h-4 w-4" />
                New Message
              </Button>
            </div>
            <ScrollArea className="flex-1">
              {conversationsLoading ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <p className="text-sm text-muted-foreground">Loading conversations...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "No conversations found" : "No conversations yet"}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    type="button"
                    className={cn(
                      "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50",
                      selectedId === conv.id && "bg-muted"
                    )}
                    onClick={() => {
                      setSelectedId(conv.id)
                      setShowMobileList(false)
                      router.replace(`/messages?conversationId=${conv.id}`, { scroll: false })
                    }}
                  >
                    <div className="relative shrink-0">
                      <Avatar>
                        <AvatarImage src={conv.otherParty.avatar ?? undefined} />
                        <AvatarFallback>
                          {conv.otherParty.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm font-medium">
                          {conv.otherParty.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ""}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {conv.lastMessage || "No messages yet"}
                      </p>
                    </div>
                    {conv.unread > 0 && (
                      <Badge className="ml-auto h-5 min-w-[20px] px-1 text-xs">
                        {conv.unread}
                      </Badge>
                    )}
                  </button>
                ))
              )}
            </ScrollArea>
          </div>

          <div
            className={cn(
              "flex flex-1 flex-col",
              showMobileList && "hidden sm:flex"
            )}
          >
            {selectedConversation ? (
              <>
                <div className="flex items-center gap-3 border-b p-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="sm:hidden"
                    onClick={() => setShowMobileList(true)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={selectedConversation.otherParty.avatar ?? undefined} />
                    <AvatarFallback>
                      {selectedConversation.otherParty.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {selectedConversation.otherParty.name}
                    </p>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-sm text-muted-foreground">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-sm text-muted-foreground">No messages yet. Send one!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn("flex", msg.isMe ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "max-w-[75%] rounded-lg px-4 py-2",
                              msg.isMe
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            <p className="text-sm">{msg.body}</p>
                            <p
                              className={cn(
                                "mt-1 text-right text-xs",
                                msg.isMe
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              )}
                            >
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                <div className="border-t p-4">
                  <div className="flex items-end gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="min-h-[40px] resize-none"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sending}
                      className="shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    Select a conversation to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      }
    >
      <MessagesPageInner />
    </Suspense>
  )
}
