"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus } from "lucide-react"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface SavePlaceScreenProps {
  onNavigate: (screen: Screen) => void
  initialAddress?: string
  goBack: () => void
}

export function SavePlaceScreen({ onNavigate, initialAddress = "", goBack }: SavePlaceScreenProps) {
  const [placeName, setPlaceName] = useState("")
  const [address, setAddress] = useState(initialAddress)
  const [selectedIcon, setSelectedIcon] = useState("🏠") // Default icon

  const handleSavePlace = () => {
    if (placeName && address) {
      const newPlace = { name: placeName, address, icon: selectedIcon }
      const storedPlaces = JSON.parse(localStorage.getItem("mediride_saved_places") || "[]")
      localStorage.setItem("mediride_saved_places", JSON.stringify([...storedPlaces, newPlace]))
      onNavigate("saved-places")
    } else {
      alert("Please enter both a place name and an address.")
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 py-4">
        <BackButton onClick={goBack} className="mb-4" />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Save this place</h1>

          <div className="space-y-6 mb-8">
            <div>
              <Label htmlFor="placeName" className="text-base font-medium text-gray-900 mb-2 block">
                Place Name
              </Label>
              <Input
                id="placeName"
                placeholder="e.g., Home, Work, Doctor's Office"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                className="h-12 text-base border-gray-200 rounded-lg"
              />
            </div>

            <div>
              <Label htmlFor="address" className="text-base font-medium text-gray-900 mb-2 block">
                Address
              </Label>
              <Input
                id="address"
                placeholder="Enter full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-12 text-base border-gray-200 rounded-lg"
              />
            </div>

            <div>
              <Label className="text-base font-medium text-gray-900 mb-3 block">Choose an Icon</Label>
              <RadioGroup value={selectedIcon} onValueChange={setSelectedIcon} className="flex gap-4 justify-center">
                <div className="flex flex-col items-center space-y-2">
                  <RadioGroupItem value="🏠" id="home-icon" className="sr-only" />
                  <Label
                    htmlFor="home-icon"
                    className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-2 border-gray-200 text-3xl data-[state=checked]:border-black"
                  >
                    🏠
                  </Label>
                  <span className="text-sm text-gray-700">Home</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <RadioGroupItem value="🏢" id="work-icon" className="sr-only" />
                  <Label
                    htmlFor="work-icon"
                    className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-2 border-gray-200 text-3xl data-[state=checked]:border-black"
                  >
                    🏢
                  </Label>
                  <span className="text-sm text-gray-700">Work</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <RadioGroupItem value="❤️" id="favorite-icon" className="sr-only" />
                  <Label
                    htmlFor="favorite-icon"
                    className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-2 border-gray-200 text-3xl data-[state=checked]:border-black"
                  >
                    ❤️
                  </Label>
                  <span className="text-sm text-gray-700">Favorite</span>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Button
            onClick={handleSavePlace}
            disabled={!placeName || !address}
            className="w-full h-12 bg-black text-white rounded-full text-base font-medium disabled:bg-gray-300"
          >
            Save Place
            <Plus className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
