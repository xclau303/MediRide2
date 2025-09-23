"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Search, X } from "lucide-react"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"
import { debounce } from "@/lib/debounce"

interface ChangePickupScreenProps {
  onNavigate: (screen: Screen, data?: any) => void
  initialPickup?: string
  goBack: () => void
}

export function ChangePickupScreen({ onNavigate, initialPickup = "", goBack }: ChangePickupScreenProps) {
  const [newPickupLocation, setNewPickupLocation] = useState(initialPickup)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Mock API call for suggestions
  const fetchSuggestions = debounce(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))
    const mockSuggestions = [
      "123 Main St, Anytown, USA",
      "456 Oak Ave, Anytown, USA",
      "789 Pine Ln, Anytown, USA",
      "101 Elm Rd, Anytown, USA",
    ].filter((address) => address.toLowerCase().includes(query.toLowerCase()))
    setSuggestions(mockSuggestions)
    setIsLoading(false)
  }, 300)

  useEffect(() => {
    fetchSuggestions(newPickupLocation)
  }, [newPickupLocation, fetchSuggestions])

  const handleSelectSuggestion = (address: string) => {
    setNewPickupLocation(address)
    setSuggestions([])
  }

  const handleConfirmChange = () => {
    if (newPickupLocation) {
      onNavigate("pickup-confirmation", { newPickup: newPickupLocation })
    } else {
      alert("Please enter a new pickup location.")
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 py-4">
        <BackButton onClick={goBack} className="mb-4" />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Change Pickup Location</h1>

          <div className="space-y-6 mb-8">
            <div>
              <Label htmlFor="pickupLocation" className="text-base font-medium text-gray-900 mb-2 block">
                New Pickup Location
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="pickupLocation"
                  placeholder="Enter new pickup address"
                  value={newPickupLocation}
                  onChange={(e) => setNewPickupLocation(e.target.value)}
                  className="h-12 text-base border-gray-200 rounded-lg pl-10 pr-8"
                />
                {newPickupLocation && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:bg-gray-100"
                    onClick={() => setNewPickupLocation("")}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear input</span>
                  </Button>
                )}
              </div>
              {isLoading && <p className="text-sm text-gray-500 mt-2">Loading suggestions...</p>}
              {suggestions.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-md max-h-48 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <p className="text-sm text-gray-800">{suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleConfirmChange}
            disabled={!newPickupLocation}
            className="w-full h-12 bg-black text-white rounded-full text-base font-medium disabled:bg-gray-300"
          >
            Confirm Change
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
