"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Send,
  Plus,
  MessageSquare,
  Check,
  CheckCheck,
  User,
} from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Avatar, AvatarFallback } from "../../../components/ui/avatar"
import { Card, CardContent } from "../../../components/ui/card"
import { cn } from "../../../lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../../../components/ui/dialog"

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

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    buyerName: "Jane Muthoni",
    buyerAvatar: null,
    product: "Kitenge Luxury Maxi Dress",
    lastMessage: "Is this available in size L?",
    time: "2 min ago",
    unread: true,
  },
  {
    id: "2",
    buyerName: "Akinyi Ochieng",
    buyerAvatar: null,
    product: "Maasai Beaded Leather Sandals",
    lastMessage: "Thank you! I received the package.",
    time: "1 hour ago",
    unread: false,
  },
  {
    id: "3",
    buyerName: "Wanjiku Kimani",
    buyerAvatar: null,
    product: "Ankara Fitted Blazer",
    lastMessage: "Can I get a discount on bulk order?",
    time: "3 hours ago",
    unread: true,
  },
  {
    id: "4",
    buyerName: "Amina Hassan",
    buyerAvatar: null,
    product: "Satin Hair Bonnet & Pillowcase Set",
    lastMessage: "What colors are available?",
    time: "1 day ago",
    unread: false,
  },
  {
    id: "5",
    buyerName: "Grace Nyambura",
    buyerAvatar: null,
    product: "Organic Coconut & Shea Body Butter",
    lastMessage: "Sure, I'll place the order now.",
    time: "2 days ago",
    unread: false,
  },
]

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  "1": [
    { id: "m1", sender: "buyer", text: "Hi, I'm interested in the Kitenge Luxury Maxi Dress.", time: "10:30 AM", read: true },
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
  "4": [
    { id: "m10", sender: "buyer", text: "Hello, I want to purchase the Satin Hair Bonnet set.", time: "Yesterday", read: true },
    { id: "m11", sender: "seller", text: "Hi Amina! We have Rose Gold and Midnight Black in stock.", time: "Yesterday", read: true },
    { id: "m12", sender: "buyer", text: "What colors are available?", time: "Yesterday", read: true },
  ],
  "5": [
    { id: "m13", sender: "buyer", text: "Is the Coconut & Shea body butter good for dry skin?", time: "2 days ago", read: true },
    { id: "m14", sender: "seller", text: "Yes it is! It provides 24-hour deep moisturization.", time: "2 days ago", read: true },
    { id: "m15", sender: "buyer", text: "Sure, I'll place the order now.", time: "2 days ago", read: true },
  ],
}

// Custom mock replies pool based on buyer questions
const BUYER_AUTOREPLIES: Record<string, string[]> = {
  "Jane Muthoni": [
    "Perfect! I will submit my order now. Do you ship to Westlands?",
    "Okay, let me know when you ship the dress. Thank you!",
  ],
  "Akinyi Ochieng": [
    "Awesome! I'll order another pair for my sister soon.",
    "Do you have a physical shop in Nairobi where I can visit?",
  ],
  "Wanjiku Kimani": [
    "Thank you for the discount. Let me make the M-Pesa payment right away.",
    "Please send me the catalog of other blazers if you have them.",
  ],
  "Amina Hassan": [
    "I will go with the Rose Gold set. Should I pay the seller number directly?",
    "Thanks for confirming. I'll make the order now.",
  ],
  "Grace Nyambura": [
    "Just sent the M-Pesa code. Please check and verify.",
    "Thank you for the quick confirmation!",
  ],
  "default": [
    "Okay, sounds good! I will order right now.",
    "Thanks for the details. I will pay via M-Pesa.",
    "Perfect! Please ship it as soon as possible.",
  ]
}

const NEW_CONTACTS = [
  { name: "Brenda Wambui", product: "Velvet Matte Lipstick" },
  { name: "Mercy Chebet", product: "Handwoven Sisal & Leather Tote" },
  { name: "Halima Omar", product: "Vitamin C & Hyaluronic Glow Serum" }
]

export default function MessagesPage() {
  const [conversationsList, setConversationsList] = useState<Conversation[]>([])
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({})
  const [selectedId, setSelectedId] = useState<string>("1")
  const [reply, setReply] = useState("")
  const [search, setSearch] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [composeOpen, setComposeOpen] = useState(false)

  // Initialize from LocalStorage or constants
  useEffect(() => {
    const storedConv = localStorage.getItem("seller_conversations")
    const storedMsg = localStorage.getItem("seller_messages")

    if (storedConv && storedMsg) {
      try {
        setConversationsList(JSON.parse(storedConv))
        setMessagesMap(JSON.parse(storedMsg))
      } catch (e) {
        setConversationsList(INITIAL_CONVERSATIONS)
        setMessagesMap(INITIAL_MESSAGES)
      }
    } else {
      setConversationsList(INITIAL_CONVERSATIONS)
      setMessagesMap(INITIAL_MESSAGES)
      localStorage.setItem("seller_conversations", JSON.stringify(INITIAL_CONVERSATIONS))
      localStorage.setItem("seller_messages", JSON.stringify(INITIAL_MESSAGES))
    }
  }, [])

  // Mark active conversation as read
  useEffect(() => {
    if (!selectedId || conversationsList.length === 0) return

    const selectedConv = conversationsList.find((c) => c.id === selectedId)
    if (selectedConv && selectedConv.unread) {
      const updated = conversationsList.map((c) =>
        c.id === selectedId ? { ...c, unread: false } : c
      )
      setConversationsList(updated)
      localStorage.setItem("seller_conversations", JSON.stringify(updated))
    }
  }, [selectedId, conversationsList])

  const saveState = (updatedList: Conversation[], updatedMap: Record<string, ChatMessage[]>) => {
    setConversationsList(updatedList)
    setMessagesMap(updatedMap)
    localStorage.setItem("seller_conversations", JSON.stringify(updatedList))
    localStorage.setItem("seller_messages", JSON.stringify(updatedMap))
  }

  function handleSend() {
    if (!reply.trim()) return

    const activeMessages = messagesMap[selectedId] ?? []
    const newMsg: ChatMessage = {
      id: `m-seller-${Date.now()}`,
      sender: "seller",
      text: reply.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    }

    const updatedMap = {
      ...messagesMap,
      [selectedId]: [...activeMessages, newMsg],
    }

    const activeConv = conversationsList.find((c) => c.id === selectedId)
    const updatedList = conversationsList.map((c) => {
      if (c.id === selectedId) {
        return {
          ...c,
          lastMessage: reply.trim(),
          time: "Just now",
        }
      }
      return c
    })

    saveState(updatedList, updatedMap)
    setReply("")

    // Trigger simulated buyer typing and reply
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const currentConv = conversationsList.find((c) => c.id === selectedId)
      const buyerName = currentConv?.buyerName ?? "default"
      const pool = (BUYER_AUTOREPLIES[buyerName] ?? BUYER_AUTOREPLIES["default"]) as string[]
      const randomText = pool[Math.floor(Math.random() * pool.length)] || "Okay, thanks!"

      const replyMsg: ChatMessage = {
        id: `m-buyer-${Date.now()}`,
        sender: "buyer",
        text: randomText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false,
      }

      const postReplyMap = {
        ...updatedMap,
        [selectedId]: [...(updatedMap[selectedId] ?? []), replyMsg],
      }

      const postReplyList = updatedList.map((c) => {
        if (c.id === selectedId) {
          return {
            ...c,
            lastMessage: randomText,
            time: "Just now",
            unread: true,
          }
        }
        return c
      })

      saveState(postReplyList, postReplyMap)
    }, 2000)
  }

  function handleCompose(contact: typeof NEW_CONTACTS[number]) {
    const existing = conversationsList.find(
      (c) => c.buyerName === contact.name && c.product === contact.product
    )

    if (existing) {
      setSelectedId(existing.id)
      setComposeOpen(false)
      return
    }

    const newId = `conv-${Date.now()}`
    const newConv: Conversation = {
      id: newId,
      buyerName: contact.name,
      buyerAvatar: null,
      product: contact.product,
      lastMessage: "Conversation started",
      time: "Just now",
      unread: false,
    }

    const initialGreeting: ChatMessage = {
      id: `m-init-${Date.now()}`,
      sender: "buyer",
      text: `Hi, I am interested in the ${contact.product}. Is it available?`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    }

    const updatedList = [newConv, ...conversationsList]
    const updatedMap = {
      ...messagesMap,
      [newId]: [initialGreeting],
    }

    saveState(updatedList, updatedMap)
    setSelectedId(newId)
    setComposeOpen(false)
  }

  const filtered = conversationsList.filter(
    (c) =>
      c.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      c.product.toLowerCase().includes(search.toLowerCase())
  )

  const activeConversation = conversationsList.find((c) => c.id === selectedId)
  const activeMessages = messagesMap[selectedId] ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-sm text-muted-foreground">
            Communicate with your buyers directly
          </p>
        </div>
        
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Compose
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Start Conversation</DialogTitle>
              <DialogDescription>
                Choose a customer inquiring about your items to begin messaging.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {NEW_CONTACTS.map((contact, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCompose(contact)}
                  className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition hover:bg-accent"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {contact.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{contact.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{contact.product}</p>
                  </div>
                  <User className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <div className="flex h-[600px] divide-x">
          {/* Sidebar */}
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
              {filtered.map((conv) => (
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
                      {conv.buyerName.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium">
                        {conv.buyerName}
                      </span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {conv.time}
                      </span>
                    </div>
                    <p className="truncate text-xs font-semibold text-[#1C5C56]">
                      {conv.product}
                    </p>
                    <p className="truncate text-xs text-muted-foreground mt-0.5">
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread && (
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No conversations found
                </div>
              )}
            </div>
          </div>

          {/* Active Chat Section */}
          <div className="flex flex-1 flex-col bg-muted/20">
            {activeConversation ? (
              <>
                <div className="flex items-center gap-3 border-b bg-white p-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {activeConversation.buyerName.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">
                      {activeConversation.buyerName}
                    </p>
                    <p className="text-xs font-medium text-[#1C5C56]">
                      Inquiring: {activeConversation.product}
                    </p>
                  </div>
                </div>

                {/* Messages List */}
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
                          "max-w-[70%] rounded-xl px-4 py-2.5 text-sm shadow-sm",
                          msg.sender === "seller"
                            ? "bg-[#341327] text-white rounded-tr-none"
                            : "bg-white text-foreground border rounded-tl-none"
                        )}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                        <div
                          className={cn(
                            "mt-1 flex items-center justify-end gap-1 text-[9px]",
                            msg.sender === "seller"
                              ? "text-white/70"
                              : "text-muted-foreground"
                          )}
                        >
                          <span>{msg.time}</span>
                          {msg.sender === "seller" && (
                            <CheckCheck className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="rounded-xl px-4 py-3 bg-white border shadow-sm rounded-tl-none">
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "0ms" }} />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "150ms" }} />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Textarea Reply Input */}
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
                      disabled={!reply.trim() || isTyping}
                      className="shrink-0 rounded-full h-10 w-10 bg-[#1C5C56] hover:bg-[#1C5C56]/90"
                    >
                      <Send className="h-4 w-4" />
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
