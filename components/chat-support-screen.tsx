"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface ChatSupportScreenProps {
  onNavigate: (screen: Screen) => void
  goBack: () => void
}

export function ChatSupportScreen({ onNavigate, goBack }: ChatSupportScreenProps) {
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState([
    { type: "agent", text: "Hi there! How can I help you today?" },
    { type: "user", text: "I need to reschedule my ride." },
    { type: "agent", text: "No problem! Can you please provide your ride ID or the date of the ride?" },
  ])

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatHistory((prev) => [...prev, { type: "user", text: message.trim() }])
      setMessage("")
      // Simulate agent response
      setTimeout(() => {
        setChatHistory((prev) => [...prev, { type: "agent", text: "Thank you, I'm looking into that for you." }])
      }, 1000)
    }
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <BackButton onClick={goBack} />
        <h1 className="text-xl font-bold text-gray-900">Chat Support</h1>
        <div className="w-10" /> {/* Placeholder for alignment */}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.type === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
      <div className="p-4 border-t border-gray-200 flex items-center gap-2">
        <Textarea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 resize-none min-h-[40px] max-h-[120px] rounded-lg border-gray-300"
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSendMessage()
            }
          }}
        />
        <Button size="icon" onClick={handleSendMessage} disabled={!message.trim()}>
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  )
}
