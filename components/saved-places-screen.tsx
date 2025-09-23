"use client";


import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Home, ChevronRight, Plus, Briefcase, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface SavedPlacesScreenProps {
  onNavigate: (screen: Screen, data?: any) => void
  goBack: () => void
}

export function SavedPlacesScreen({ onNavigate, goBack }: SavedPlacesScreenProps) {
  const [savedPlaces, setSavedPlaces] = useState<{ name: string; address: string; icon: string }[]>([])

  useEffect(() => {
    const storedPlaces = JSON.parse(localStorage.getItem("mediride_saved_places") || "[]")
    setSavedPlaces(storedPlaces)
  }, [])

  const handleSelectPlace = (address: string) => {
    onNavigate("set-location", { initialDropoff: address, fromScreen: "saved-places" })
  }

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case "🏠":
        return <Home className="h-6 w-6" />
      case "🏢":
        return <Briefcase className="h-6 w-6" />
      case "❤️":
        return <Heart className="h-6 w-6" />
      default:
        return null
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 py-4">
        <BackButton onClick={goBack} className="mb-4" />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Choose a place</h1>
          <div className="space-y-4 mb-8">
            {savedPlaces.length === 0 ? (
              <p className="text-center text-gray-500">No saved places yet. Add one!</p>
            ) : (
              savedPlaces.map((place, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSelectPlace(place.address)}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gray-200 text-gray-600">
                      {getIconComponent(place.icon) || place.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{place.name}</p>
                    <p className="text-sm text-gray-600">{place.address}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              ))
            )}
          </div>
          <Button
            onClick={() => onNavigate("add-place")}
            className="w-full h-12 bg-black text-white rounded-full text-base font-medium"
          >
            Add Saved Place
            <Plus className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
