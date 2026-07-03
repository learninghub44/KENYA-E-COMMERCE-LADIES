"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Search,
  Send,
  Plus,
  Paperclip,
  ChevronLeft,
  Circle,
} from "lucide-react"

import { cn } from "../../../lib/utils"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Badge } from "../../../components/ui/badge"
import { Separator } from "../../../components/ui/separator"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { Textarea } from "../../../components/ui/textarea"
import { Breadcrumbs } from "../../../components/shared/breadcrumbs"

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: string
}

interface Conversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  lastTime: string
  unread: number
  online: boolean
  messages: Message[]
}

export default function MessagesPage() {
  const [conversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(
    conversations[0]?.id ?? null
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [messageInput, setMessageInput] = useState("")
  const [showMobileList, setShowMobileList] = useState(true)

  const selectedConversation = conversations.find(
    (c) => c.id === selectedId
  )

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return
    setMessageInput("")
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Messages" },
        ]}
      />

      <h1 className="mb-6 text-2xl font-bold tracking-tight">Messages</h1>

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
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => {}}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Message
              </Button>
            </div>
            <ScrollArea className="flex-1">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No conversations found
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
                    }}
                  >
                    <div className="relative shrink-0">
                      <Avatar>
                        <AvatarImage src={conv.avatar} />
                        <AvatarFallback>
                          {conv.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {conv.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm font-medium">
                          {conv.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {conv.lastTime}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {conv.lastMessage}
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
                    <AvatarImage src={selectedConversation.avatar} />
                    <AvatarFallback>
                      {selectedConversation.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {selectedConversation.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedConversation.messages.map((msg) => {
                      const isMe = msg.senderId === "me"
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex",
                            isMe ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[75%] rounded-lg px-4 py-2",
                              isMe
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            <p className="text-sm">{msg.text}</p>
                            <p
                              className={cn(
                                "mt-1 text-right text-xs",
                                isMe
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              )}
                            >
                              {msg.timestamp}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>

                <div className="border-t p-4">
                  <div className="flex items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => {}}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
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
                      disabled={!messageInput.trim()}
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
