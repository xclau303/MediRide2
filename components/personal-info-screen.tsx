"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface PersonalInfoScreenProps {
  onNavigate: (screen: Screen) => void
  onUpdateData: (data: any) => void
  goBack: () => void
}

const DateInput = ({ value, onChange }) => (
  <div>
    <Label className="text-base font-medium text-gray-900 mb-2 block">Date of Birth</Label>
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 h-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
      />
    </div>
  </div>
)

export function PersonalInfoScreen({ onNavigate, onUpdateData, goBack }: PersonalInfoScreenProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState(() => {
    // Default to 30 years ago
    const date = new Date()
    date.setFullYear(date.getFullYear() - 30)
    return date.toISOString().split("T")[0]
  })
  const [phone, setPhone] = useState("")

  const handleContinue = () => {
    if (firstName && lastName && dateOfBirth && phone) {
      const date = new Date(dateOfBirth)
      onUpdateData({
        firstName,
        lastName,
        birthMonth: date.getMonth() + 1,
        birthDay: date.getDate(),
        birthYear: date.getFullYear(),
        phone,
      })
      onNavigate("location")
    } else {
      alert("Please fill in all personal information.")
    }
  }

  const handleDateChange = (e) => {
    setDateOfBirth(e.target.value)
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 py-4">
        <BackButton onClick={goBack} className="mb-4" />
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Personal Information</h1>

          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="firstName"
                  className="text-base font-medium text-gray-900 mb-2 block"
                >
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-12 text-base border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <Label
                  htmlFor="lastName"
                  className="text-base font-medium text-gray-900 mb-2 block"
                >
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-12 text-base border-gray-200 rounded-lg"
                />
              </div>
            </div>

            <DateInput value={dateOfBirth} onChange={handleDateChange} />

            <div>
              <Label
                htmlFor="phone"
                className="text-base font-medium text-gray-900 mb-2 block"
              >
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(XXX) XXX-XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 text-base border-gray-200 rounded-lg"
              />
            </div>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!firstName || !lastName || !dateOfBirth || !phone}
            className="w-full h-12 bg-black text-white rounded-full text-base font-medium disabled:bg-gray-300"
          >
            Continue
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
