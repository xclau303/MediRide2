"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface EditProfileScreenProps {
  onNavigate: (screen: Screen) => void
  profileData: any
  onUpdateProfileData: (data: any) => void
  goBack: () => void
}

export function EditProfileScreen({ onNavigate, profileData, onUpdateProfileData, goBack }: EditProfileScreenProps) {
  const [firstName, setFirstName] = useState(profileData.firstName || "")
  const [lastName, setLastName] = useState(profileData.lastName || "")
  const [birthMonth, setBirthMonth] = useState(profileData.birthMonth || "")
  const [birthDay, setBirthDay] = useState(profileData.birthDay || "")
  const [birthYear, setBirthYear] = useState(profileData.birthYear || "")
  const [address, setAddress] = useState(profileData.address || "")
  const [phone, setPhone] = useState(profileData.phone || "")
  const [language, setLanguage] = useState(profileData.language || "English")
  const [insuranceProvider, setInsuranceProvider] = useState(profileData.insuranceProvider || "")
  const [policyNumber, setPolicyNumber] = useState(profileData.policyNumber || "")
  const [expiryDate, setExpiryDate] = useState(profileData.expiryDate || "")

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

  const handleSaveProfile = () => {
    const updatedData = {
      firstName,
      lastName,
      birthMonth,
      birthDay,
      birthYear,
      address,
      phone,
      language,
      insuranceProvider,
      policyNumber,
      expiryDate,
    }
    onUpdateProfileData(updatedData)
    onNavigate("profile")
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 py-4">
        <BackButton onClick={goBack} className="mb-4" />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Profile</h1>

          <div className="space-y-6 mb-8">
            {/* Personal Information */}
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-1 block">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-10 text-base border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-1 block">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-10 text-base border-gray-200 rounded-lg"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-1 block">
                Address
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-10 text-base border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1 block">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 text-base border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="language" className="text-sm font-medium text-gray-700 mb-1 block">
                Preferred Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-10 text-base border-gray-200 rounded-lg">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="birthMonth" className="text-sm font-medium text-gray-700 mb-1 block">
                  Birth Month
                </Label>
                <Input
                  id="birthMonth"
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  placeholder="MM"
                  maxLength={2}
                  className="h-10 text-base border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="birthDay" className="text-sm font-medium text-gray-700 mb-1 block">
                  Birth Day
                </Label>
                <Input
                  id="birthDay"
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  placeholder="DD"
                  maxLength={2}
                  className="h-10 text-base border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="birthYear" className="text-sm font-medium text-gray-700 mb-1 block">
                  Birth Year
                </Label>
                <Input
                  id="birthYear"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  placeholder="YYYY"
                  maxLength={4}
                  className="h-10 text-base border-gray-200 rounded-lg"
                />
              </div>
            </div>

            {/* Insurance Information */}
            <h2 className="text-xl font-semibold text-gray-900 mt-8">Insurance Information</h2>
            <div>
              <Label htmlFor="insuranceProvider" className="text-sm font-medium text-gray-700 mb-1 block">
                Insurance Provider
              </Label>
              <Select value={insuranceProvider} onValueChange={setInsuranceProvider}>
                <SelectTrigger className="h-10 text-base border-gray-200 rounded-lg">
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
              <Label htmlFor="policyNumber" className="text-sm font-medium text-gray-700 mb-1 block">
                Policy Number
              </Label>
              <Input
                id="policyNumber"
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                className="h-10 text-base border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="expiryDate" className="text-sm font-medium text-gray-700 mb-1 block">
                Expiry Date
              </Label>
              <Input
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/DD/YYYY"
                className="h-10 text-base border-gray-200 rounded-lg"
              />
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            className="w-full h-12 bg-black text-white rounded-full text-base font-medium"
          >
            Save Changes
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
