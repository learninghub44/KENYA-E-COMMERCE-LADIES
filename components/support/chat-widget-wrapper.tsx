"use client"

import dynamic from "next/dynamic"

const ChatWidget = dynamic(
  () => import("./chat-widget").then((mod) => ({ default: mod.ChatWidget })),
  { ssr: false }
)

export function ChatWidgetWrapper() {
  return <ChatWidget />
}
