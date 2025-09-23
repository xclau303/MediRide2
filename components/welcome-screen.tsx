"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { Screen } from "@/app/page"

interface WelcomeScreenProps {
  onNavigate: (screen: Screen) => void
}

export function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to MediRide</h1>
        <p className="text-gray-600 text-lg mb-8">Your trusted partner for safe and reliable medical transportation.</p>
        <div className="w-full space-y-4">
          <Button
            onClick={() => onNavigate("login")}
            className="w-full h-12 bg-black text-white rounded-full text-base font-medium"
          >
            Login
          </Button>
          <Button
            onClick={() => onNavigate("signup")}
            variant="outline"
            className="w-full h-12 border-gray-300 text-gray-900 rounded-full text-base font-medium"
          >
            Sign Up
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
