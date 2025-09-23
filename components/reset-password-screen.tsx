"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface ResetPasswordScreenProps {
  onNavigate: (screen: Screen) => void
  goBack: () => void
}

export function ResetPasswordScreen({ onNavigate, goBack }: ResetPasswordScreenProps) {
  const [email, setEmail] = useState("")

  const handleResetPassword = () => {
    if (email) {
      // Simulate password reset email sending
      console.log("Sending reset email to:", email)
      onNavigate("reset-confirm") // Navigate to confirmation screen
    } else {
      alert("Please enter your email address.")
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 py-4">
        <BackButton onClick={goBack} className="mb-4" />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Reset Password</h1>

          <div className="space-y-6 mb-8">
            <p className="text-gray-600 text-center">
              Enter your email address below and we'll send you a link to reset your password.
            </p>
            <div>
              <Label htmlFor="email" className="text-base font-medium text-gray-900 mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base border-gray-200 rounded-lg"
              />
            </div>
          </div>

          <Button
            onClick={handleResetPassword}
            disabled={!email}
            className="w-full h-12 bg-black text-white rounded-full text-base font-medium disabled:bg-gray-300"
          >
            Send Reset Link
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
