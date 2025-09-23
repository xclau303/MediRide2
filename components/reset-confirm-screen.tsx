"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import type { Screen } from "@/app/page"

interface ResetConfirmScreenProps {
  onNavigate: (screen: Screen) => void
  goBack: () => void
}

export function ResetConfirmScreen({ onNavigate, goBack }: ResetConfirmScreenProps) {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        className="flex flex-col items-center"
      >
        <CheckCircle2 className="h-24 w-24 text-green-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Password Reset!</h1>
        <p className="text-gray-600 text-lg mb-8">
          Your password has been successfully reset. You can now log in with your new password.
        </p>
        <Button
          onClick={() => onNavigate("login")}
          className="w-full max-w-xs h-12 bg-black text-white rounded-full text-base font-medium"
        >
          Back to Login
        </Button>
      </motion.div>
    </div>
  )
}
