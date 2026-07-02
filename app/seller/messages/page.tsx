"use client"

import { useState } from "react"
import {
  Search,
  Send,
  Plus,
  MessageSquare,
  Check,
  CheckCheck,
} from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Badge } from "../../../components/ui/badge"
import {
  Card,
  CardContent,
} from "../../../components/ui/card"
import { cn } from "../../../lib/utils"

interface Conversation {
  id: string
  buyerName: string
  buyerAvatar: string | null
  product: string
  lastMessage: string
  time: string
  unread: boolean
}

interface ChatMessage {
  id: string
  sender: "buyer" | "seller"
  text: string
  time: string
  read: boolean
}

const conversations: Conversation[] = [
  {
    id: "1",
    buyerName: "Jane Muthoni",
    buyerAvatar: null,
    product: "Kitenge Maxi Dress",
    lastMessage: "Is this available in size L?",
    time: "2 min ago",
    unread: true,
  },
  {
    id: "2",
    buyerName: "Akinyi Ochieng",
    buyerAvatar: null,
    product: "Beaded Sandals",
    lastMessage: "Thank you! I received the package.",
    time: "1 hour ago",
    unread: false,
  },
  {
    id: "3",
    buyerName: "Wanjiku Kimani",
    buyerAvatar: null,
    product: "Ankara Blazer",
    lastMessage: "Can I get a discount on bulk order?",
    time: "3 hours ago",
    unread: true,
  },
  {
    id: "4",
    buyerName: "Amina Hassan",
    buyerAvatar: null,
    product: "Kente Scarf Set",
    lastMessage: "What colors are available?",
    time: "1 day ago",
    unread: false,
  },
  {
    id: "5",
    buyerName: "Grace Nyambura",
    buyerAvatar: null,
    product: "Dashiki Top",
    lastMessage: "Sure, I'll place the order now.",
    time: "2 days ago",
    unread: false,
  },
]

const messagesByConversation: Record<string, ChatMessage[]> = {
  "1": [
    { id: "m1", sender: "buyer", text: "Hi, I'm interested in the Kitenge Maxi Dress.", time: "10:30 AM", read: true },
    { id: "m2", sender: "seller", text: "Hello! Yes, it's still available. What size are you looking for?", time: "10:32 AM", read: true },
    { id: "m3", sender: "buyer", text: "Is this available in size L?", time: "10:35 AM", read: false },
  ],
  "2": [
    { id: "m4", sender: "buyer", text: "Hi, I just received my Beaded Sandals!", time: "9:00 AM", read: true },
    { id: "m5", sender: "seller", text: "That's great! Hope you love them.", time: "9:05 AM", read: true },
    { id: "m6", sender: "buyer", text: "Thank you! I received the package.", time: "9:10 AM", read: true },
  ],
  "3": [
    { id: "m7", sender: "buyer", text: "I run a boutique and would like to order 10 Ankara Blazers.", time: "2:00 PM", read: true },
    { id: "m8", sender: "seller", text: "We offer bulk pricing for orders of 5 or more!", time: "2:05 PM", read: true },
    { id: "m9", sender: "buyer", text: "Can I get a discount on bulk order?", time: "2:10 PM", read: false },
  ],
}

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState<string>("1")
  const [reply, setReply] = useState("")
  const [search, setSearch] = useState("")

  const filtered = conversations.filter(
    (c) =>
      c.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      c.product.toLowerCase().includes(search.toLowerCase())
  )

  const activeConversation = conversations.find((c) => c.id === selectedId)
  const activeMessages = messagesByConversation[selectedId] ?? []

  function handleSend() {
    if (!reply.trim()) return
    console.log("Send message:", reply)
    setReply("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-sm text-muted-foreground">
            Communicate with your buyers.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Compose
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex h-[600px] divide-x">
          <div className="flex w-80 flex-col">
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
              {filtered.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedId(conv.id)}
                  className={cn(
                    "flex w-full gap-3 border-b p-3 text-left transition-colors hover:bg-accent/50",
                    selectedId === conv.id && "bg-accent"
                  )}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback>
                      {conv.buyerName.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium">
                        {conv.buyerName}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {conv.time}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {conv.product}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread && (
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            {activeConversation ? (
              <>
                <div className="flex items-center gap-3 border-b p-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {activeConversation.buyerName.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {activeConversation.buyerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activeConversation.product}
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {activeMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.sender === "seller" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg px-3 py-2 text-sm",
                          msg.sender === "seller"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p>{msg.text}</p>
                        <div
                          className={cn(
                            "mt-1 flex items-center justify-end gap-1",
                            msg.sender === "seller"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          <span className="text-[10px]">{msg.time}</span>
                          {msg.sender === "seller" &&
                            (msg.read ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t p-3">
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
                      className="min-h-[40px]"
                      rows={1}
                    />
                    <Button
                      size="icon"
                      onClick={handleSend}
                      disabled={!reply.trim()}
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
                  <MessageSquare className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Select a conversation
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
