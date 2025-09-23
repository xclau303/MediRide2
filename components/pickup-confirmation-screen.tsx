"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Car } from "lucide-react"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface PickupConfirmationScreenProps {
  onNavigate: (screen: Screen, data?: any) => void
  goBack: () => void
}

export function PickupConfirmationScreen({ onNavigate, goBack }: PickupConfirmationScreenProps) {
  const [pickupLocation] = useState("123 Main St, Anytown, USA")
  const [dropoffLocation] = useState("City Hospital, 456 Oak Ave, Anytown, USA")
  const [rideType] = useState("Standard Ride")
  const [estimatedFare] = useState("$15.00")
  const [estimatedTime] = useState("15-20 min")

  const handleConfirmRide = () => {
    onNavigate("waiting-for-ride")
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <BackButton onClick={goBack} />
        <h1 className="text-xl font-bold text-gray-900">Confirm Ride</h1>
        <div className="w-10" /> {/* Placeholder for alignment */}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          {/* Ride Details */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Ride Details</h2>
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-gray-700">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Pickup:</span> {pickupLocation}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Dropoff:</span> {dropoffLocation}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <Car className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Ride Type:</span> {rideType}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Estimated Time:</span> {estimatedTime}
              </p>
            </div>
          </div>

          {/* Estimated Fare */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-blue-800">Estimated Fare</h2>
            <p className="text-2xl font-bold text-blue-800">{estimatedFare}</p>
          </div>

          {/* Actions */}
          <Button
            onClick={handleConfirmRide}
            className="w-full h-12 bg-black text-white rounded-full text-base font-medium mb-4"
          >
            Confirm Ride
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 border-gray-300 text-gray-900 rounded-full text-base font-medium bg-transparent"
            onClick={() => onNavigate("change-pickup", { initialPickup: pickupLocation })}
          >
            Change Pickup Location
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
