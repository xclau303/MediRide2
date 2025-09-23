"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface LocationScreenProps {
  onNavigate: (screen: Screen) => void
  onUpdateData: (data: any) => void
  goBack: () => void
}

export function LocationScreen({ onNavigate, onUpdateData, goBack }: LocationScreenProps) {
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")

  const handleContinue = () => {
    if (address && city && state && zipCode) {
      onUpdateData({ address, city, state, zipCode })
      onNavigate("insurance")
    } else {
      alert("Please fill in all address details.")
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 py-4">
        <BackButton onClick={goBack} className="mb-4" />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Location</h1>

          <div className="space-y-6 mb-8">
            <div>
              <Label htmlFor="address" className="text-base font-medium text-gray-900 mb-2 block">
                Street Address
              </Label>
              <Input
                id="address"
                placeholder="Enter street address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-12 text-base border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="city" className="text-base font-medium text-gray-900 mb-2 block">
                City
              </Label>
              <Input
                id="city"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-12 text-base border-gray-200 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state" className="text-base font-medium text-gray-900 mb-2 block">
                  State
                </Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="h-12 text-base border-gray-200 rounded-lg">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NY">NY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="zipCode" className="text-base font-medium text-gray-900 mb-2 block">
                  Zip Code
                </Label>
                <Input
                  id="zipCode"
                  placeholder="Enter zip code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="h-12 text-base border-gray-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!address || !city || !state || !zipCode}
            className="w-full h-12 bg-black text-white rounded-full text-base font-medium disabled:bg-gray-300"
          >
            Continue
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
