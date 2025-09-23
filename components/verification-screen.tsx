"use client";


import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface VerificationScreenProps {
  onNavigate: (screen: Screen) => void
  goBack: () => void
}

export function VerificationScreen({ onNavigate, goBack }: VerificationScreenProps) {
  const [code, setCode] = useState(["", "", "", ""]) // Array for 4-digit code

  const handleCodeChange = (index: number, value: string) => {
    const newCode = [...code]
    newCode[index] = value.slice(-1) // Only take the last character
    setCode(newCode)

    // Auto-focus to next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-input-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleVerify = () => {
    const fullCode = code.join("")
    if (fullCode.length === 4) {
      // Simulate verification logic
      console.log("Verifying code:", fullCode)
      onNavigate("dashboard")
    } else {
      alert("Please enter the full 4-digit code.")
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 py-4">
        <BackButton onClick={goBack} className="mb-4" />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Verify Email</h1>

          <div className="space-y-6 mb-8 text-center">
            <p className="text-gray-600">We've sent a 4-digit verification code to your email address.</p>
            <div className="flex justify-center gap-4">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  id={`code-input-${index}`}
                  type="tel" // Use tel for numeric keyboard on mobile
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  className="w-16 h-16 text-4xl text-center border-gray-300 rounded-lg"
                />
              ))}
            </div>
            <Button variant="link" className="p-0 h-auto text-blue-600 text-sm font-medium">
              Resend Code
            </Button>
          </div>

          <Button
            onClick={handleVerify}
            disabled={code.join("").length !== 4}
            className="w-full h-12 bg-black text-white rounded-full text-base font-medium disabled:bg-gray-300"
          >
            Verify
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
