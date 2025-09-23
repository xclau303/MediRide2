"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface LoginScreenProps {
  onNavigate: (screen: Screen) => void
  goBack: () => void
}

export function LoginScreen({ onNavigate, goBack }: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = () => {
    if (email && password) {
      // Simulate login logic
      console.log("Logging in with:", { email, password })
      onNavigate("dashboard") // Navigate to dashboard on successful login
    } else {
      alert("Please enter both email and password.")
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 py-4">
        <BackButton onClick={goBack} className="mb-4" />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Welcome Back!</h1>

          <div className="space-y-6 mb-8">
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
            <div>
              <Label htmlFor="password" className="text-base font-medium text-gray-900 mb-2 block">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base border-gray-200 rounded-lg pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600 text-sm font-medium"
              onClick={() => onNavigate("reset-password")}
            >
              Forgot Password?
            </Button>
          </div>

          <Button
            onClick={handleLogin}
            disabled={!email || !password}
            className="w-full h-12 bg-black text-white rounded-full text-base font-medium disabled:bg-gray-300"
          >
            Login
          </Button>

          <p className="text-center text-gray-600 text-sm mt-6">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600 font-medium"
              onClick={() => onNavigate("signup")}
            >
              Sign Up
            </Button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
