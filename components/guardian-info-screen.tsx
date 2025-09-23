"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface GuardianInfoScreenProps {
  onNavigate: (screen: Screen) => void
  goBack: () => void
}

export function GuardianInfoScreen({ onNavigate, goBack }: GuardianInfoScreenProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [relationship, setRelationship] = useState("")
  const [phone, setPhone] = useState("")

  const handleContinue = () => {
    if (firstName && lastName && relationship && phone) {
      onNavigate("verification")
    } else {
      alert("Please fill in all guardian information.")
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 py-4">
        <BackButton onClick={goBack} className="mb-4" />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Guardian Information</h1>

          <div className="space-y-6 mb-8">
            <div>
              <Label htmlFor="firstName" className="text-base font-medium text-gray-900 mb-2 block">
                First Name
              </Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-12 text-base border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-base font-medium text-gray-900 mb-2 block">
                Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-12 text-base border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="relationship" className="text-base font-medium text-gray-900 mb-2 block">
                Relationship
              </Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger className="h-12 text-base border-gray-200 rounded-lg">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="guardian">Legal Guardian</SelectItem>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone" className="text-base font-medium text-gray-900 mb-2 block">
                Phone Number
              </Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 text-base border-gray-200 rounded-lg"
              />
            </div>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!firstName || !lastName || !relationship || !phone}
            className="w-full h-12 bg-black text-white rounded-full text-base font-medium disabled:bg-gray-300"
          >
            Continue
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
