"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface InsuranceScreenProps {
  onNavigate: (screen: Screen) => void
  onUpdateData: (data: any) => void
  goBack: () => void
}

export function InsuranceScreen({ onNavigate, onUpdateData, goBack }: InsuranceScreenProps) {
  const [insuranceProvider, setInsuranceProvider] = useState("")
  const [memberId, setMemberId] = useState("")

  const insuranceOptions = [
    "Aetna",
    "Anthem",
    "Blue Cross Blue Shield",
    "Cigna",
    "Humana",
    "Kaiser Permanente",
    "Medicaid",
    "Medicare",
    "UnitedHealthcare",
    "Other",
  ]

  const handleContinue = () => {
    if (insuranceProvider && memberId) {
      onUpdateData({ insuranceProvider, memberId })
      onNavigate("guardian") // Next step in signup flow
    } else {
      alert("Please fill in all insurance details.")
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 py-4">
        <BackButton onClick={goBack} className="mb-4" />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Insurance Information</h1>

          <div className="space-y-6 mb-8">
            <div>
              <Label htmlFor="insuranceProvider" className="text-base font-medium text-gray-900 mb-2 block">
                Insurance Provider
              </Label>
              <Select value={insuranceProvider} onValueChange={setInsuranceProvider}>
                <SelectTrigger className="h-12 text-base border-gray-200 rounded-lg">
                  <SelectValue placeholder="Select your insurance provider" />
                </SelectTrigger>
                <SelectContent>
                  {insuranceOptions.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="memberId" className="text-base font-medium text-gray-900 mb-2 block">
                Member ID
              </Label>
              <Input
                id="memberId"
                placeholder="Enter member ID"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="h-12 text-base border-gray-200 rounded-lg"
              />
            </div>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!insuranceProvider || !memberId}
            className="w-full h-12 bg-black text-white rounded-full text-base font-medium disabled:bg-gray-300"
          >
            Continue
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
