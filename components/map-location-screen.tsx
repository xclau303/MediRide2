"use client"

import type React from "react"
import { useState, useRef } from "react"
import { ArrowLeft, Search, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import BaseMap from "./base-map"

interface MapLocationScreenProps {
  onNavigate: (screen: string, data: any) => void
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
  goBack: () => void
  locationType?: "pickup" | "destination"
  currentPickup?: string
  currentDropoff?: string
}

export function MapLocationScreen({
  onNavigate,
  onLocationSelect,
  goBack,
  locationType = "destination",
  currentPickup = "",
  currentDropoff = "",
}: MapLocationScreenProps) {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string }>(() => {
    // Use existing pickup/dropoff location if available
    const existingAddress = locationType === "pickup" ? currentPickup : currentDropoff
    if (existingAddress && existingAddress !== "") {
      // For now, use default coordinates but preserve the address
      // In a real app, you'd geocode the existing address to get coordinates
      return {
        lat: 40.7128,
        lng: -74.006,
        address: existingAddress,
      }
    }
    return {
      lat: 40.7128,
      lng: -74.006,
      address: "Select location on map",
    }
  })

  const [isSelectingLocation, setIsSelectingLocation] = useState(false)

  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)

  const handleLocationSelect = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      )
      const data = await response.json()

      const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`

      setSelectedLocation({ lat, lng, address })
    } catch (error) {
      console.log("Geocoding error:", error)
      setSelectedLocation({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` })
    }
  }

  const handleMapCenterChange = async (lat: number, lng: number) => {
    if (!isSelectingLocation) return

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      )
      const data = await response.json()
      const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`

      setSelectedLocation({ lat, lng, address })
    } catch (error) {
      console.log("Geocoding error:", error)
      setSelectedLocation({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` })
    }
  }

  const handleStartLocationSelection = () => {
    setIsSelectingLocation(true)
  }

  const handleStopLocationSelection = () => {
    setIsSelectingLocation(false)
  }

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      if (locationType === "destination") {
        onNavigate("confirm-location", {
          pickupLocation: currentPickup,
          dropoffLocation: selectedLocation.address,
          dropoffLatLng: { lat: selectedLocation.lat, lng: selectedLocation.lng },
          pickupLatLng: currentPickup ? { lat: 40.7128, lng: -74.006 } : undefined,
        })
      } else {
        onNavigate("set-location", {
          selectedAddress: selectedLocation.address,
          isFromMap: true,
          initialPickup: selectedLocation.address,
          initialDropoff: currentDropoff,
        })
      }
    }
  }

  const handleDragStart = (event: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientY = "touches" in event ? event.touches[0].clientY : event.clientY
    startY.current = clientY - dragY
  }

  const handleDragMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return

    event.preventDefault()
    const clientY = "touches" in event ? event.touches[0].clientY : event.clientY
    const newY = clientY - startY.current
    const maxDrag = 120

    setDragY(Math.max(-maxDrag, Math.min(maxDrag, newY)))
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    const threshold = 60

    if (Math.abs(dragY) > threshold) {
      setDragY(dragY > 0 ? 120 : -120)
    } else {
      setDragY(0)
    }
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col relative overflow-hidden">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-30">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          className="bg-white text-gray-900 hover:bg-gray-50 rounded-full w-12 h-12 p-0 shadow-lg"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="absolute bottom-80 right-4 z-30">
        <Button
          variant="ghost"
          size="sm"
          onClick={isSelectingLocation ? handleStopLocationSelection : handleStartLocationSelection}
          className={`rounded-full w-12 h-12 p-0 shadow-lg ${
            isSelectingLocation ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          <Target className="h-6 w-6" />
        </Button>
      </div>

      <div className="w-full h-full relative">
        <BaseMap
          center={[selectedLocation.lat, selectedLocation.lng]}
          zoom={isSelectingLocation ? 16 : 10}
          onClick={!isSelectingLocation ? handleLocationSelect : undefined}
          showCenterPin={isSelectingLocation}
          onMapMove={isSelectingLocation ? handleMapCenterChange : undefined}
          markers={
            !isSelectingLocation
              ? [
                  {
                    lat: selectedLocation.lat,
                    lng: selectedLocation.lng,
                    type: locationType === "pickup" ? "pickup" : "dropoff",
                  },
                ]
              : []
          }
        />
      </div>

      {/* Draggable Bottom Sheet */}
      <motion.div
        ref={dragRef}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 z-30 shadow-2xl border-t border-gray-200"
        style={{ y: dragY }}
        animate={{ y: dragY }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6 cursor-grab active:cursor-grabbing"></div>

        <div className="text-center mb-4">
          <h2 className="text-gray-900 text-xl font-semibold mb-2">
            Set your {locationType === "pickup" ? "pickup location" : "destination"}
          </h2>
          <p className="text-gray-600 text-sm">
            {isSelectingLocation
              ? "Move the map to position the pin, then tap the target button when done"
              : "Tap on map to select location or use the target button to drag the pin"}
          </p>
        </div>

        {/* Address Input */}
        <div className="relative mb-6">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <div className={`w-2 h-2 rounded-full ${locationType === "pickup" ? "bg-green-600" : "bg-blue-600"}`}></div>
          </div>
          <input
            type="text"
            value={selectedLocation.address}
            onChange={(e) => setSelectedLocation((prev) => ({ ...prev, address: e.target.value }))}
            className="w-full bg-gray-50 text-gray-900 pl-8 pr-12 py-4 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder={`Enter ${locationType === "pickup" ? "pickup location" : "destination"}`}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        {isSelectingLocation && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm font-medium text-center">
              📍 Pin selection mode active - Move the map to adjust pin position
            </p>
          </div>
        )}

        {/* Confirm Button */}
        <Button
          onClick={handleConfirmLocation}
          disabled={selectedLocation.address === "Select location on map"}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-lg font-medium text-lg"
        >
          Confirm {locationType === "pickup" ? "pickup location" : "destination"}
        </Button>
      </motion.div>
    </div>
  )
}
