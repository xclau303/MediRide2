"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface GuardianScreenProps {
  onNavigate: (screen: Screen) => void
  onUpdateData: (data: any) => void
  goBack: () => void
}

export function GuardianScreen({ onNavigate, onUpdateData, goBack }: GuardianScreenProps) {
  const [hasGuardian, setHasGuardian] = useState<string | null>(null)

  const handleContinue = () => {
    if (hasGuardian === "yes") {
      onUpdateData({ hasGuardian: true })
      onNavigate("guardian-info")
    } else if (hasGuardian === "no") {
      onUpdateData({ hasGuardian: false })
      onNavigate("verification") // Updated navigation order: Guardian -> Email Verification
    } else {
      alert("Please select an option.")
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 py-4">
        <BackButton onClick={goBack} className="mb-4" />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Do you have a legal guardian?</h1>

          <div className="space-y-6 mb-8">
            <RadioGroup value={hasGuardian || ""} onValueChange={setHasGuardian} className="space-y-4">
              <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                <RadioGroupItem value="yes" id="has-guardian-yes" />
                <Label htmlFor="has-guardian-yes" className="text-base font-medium text-gray-900 flex-1">
                  Yes, I have a legal guardian.
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                <RadioGroupItem value="no" id="has-guardian-no" />
                <Label htmlFor="has-guardian-no" className="text-base font-medium text-gray-900 flex-1">
                  No, I do not have a legal guardian.
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={handleContinue}
            disabled={hasGuardian === null}
            className="w-full h-12 bg-black text-white rounded-full text-base font-medium disabled:bg-gray-300"
          >
            Continue
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
