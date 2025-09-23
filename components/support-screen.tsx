"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MessageCircle, HelpCircle, ChevronRight } from "lucide-react"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface SupportScreenProps {
  onNavigate: (screen: Screen) => void
  goBack: () => void
}

export function SupportScreen({ onNavigate, goBack }: SupportScreenProps) {
  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 py-4">
        <BackButton onClick={goBack} className="mb-4" />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Help & Support</h1>

          <div className="space-y-4 mb-8">
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex items-center justify-start gap-4 text-base font-medium border-gray-200 rounded-lg bg-transparent"
              onClick={() => onNavigate("chat-support")}
            >
              <MessageCircle className="h-6 w-6 text-blue-600" />
              Chat with Support
              <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex items-center justify-start gap-4 text-base font-medium border-gray-200 rounded-lg bg-transparent"
              onClick={() => onNavigate("faq")}
            >
              <HelpCircle className="h-6 w-6 text-blue-600" />
              Frequently Asked Questions
              <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
