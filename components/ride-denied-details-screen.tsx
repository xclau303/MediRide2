"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { XCircle, MapPin, Clock, MessageCircle } from "lucide-react"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface RideDeniedDetailsScreenProps {
  onNavigate: (screen: Screen) => void
  rideDetails?: {
    title: string
    date: string
    status: string
    pickup: string
    dropoff: string
    reason?: string
  }
  goBack: () => void
}

export function RideDeniedDetailsScreen({ onNavigate, rideDetails, goBack }: RideDeniedDetailsScreenProps) {
  const defaultRideDetails = {
    title: "Ride Request",
    date: "Thur, Jan 1, 10:00 AM",
    status: "Denied",
    pickup: "123 Main St, Anytown",
    dropoff: "City Hospital, 456 Oak Ave",
    reason: "No available drivers in your area at this time.",
  }

  const currentRideDetails = rideDetails || defaultRideDetails

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <BackButton onClick={goBack} />
        <h1 className="text-xl font-bold text-gray-900">Ride Denied</h1>
        <div className="w-10" /> {/* Placeholder for alignment */}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col items-center text-center mb-6">
            <XCircle className="h-24 w-24 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Ride Was Denied</h2>
            <p className="text-gray-600 text-lg">{currentRideDetails.reason || "Reason not specified."}</p>
          </div>

          {/* Ride Details */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ride Information</h3>
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-gray-700">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Date & Time:</span> {currentRideDetails.date}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Pickup:</span> {currentRideDetails.pickup}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Dropoff:</span> {currentRideDetails.dropoff}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => onNavigate("set-location")}
              className="w-full h-12 bg-black text-white rounded-full text-base font-medium"
            >
              Try Booking Again
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 rounded-full text-base font-medium bg-transparent"
              onClick={() => onNavigate("chat-support")}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Support
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
