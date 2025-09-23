"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Car, MessageCircle, Calendar, X } from "lucide-react"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface ReservationDetailsScreenProps {
  onNavigate: (screen: Screen, data?: any) => void
  goBack: () => void
  rideDetails?: {
    id: number
    title: string
    pickupAddress: string
    dropoffAddress: string
    dateTime: Date
    status: string
    icon: string
    driver: { name: string; vehicle: string; plate: string } | null
  }
}

export function ReservationDetailsScreen({ onNavigate, goBack, rideDetails }: ReservationDetailsScreenProps) {
  if (!rideDetails) {
    // Fallback if rideDetails is not provided, e.g., navigate back or show error
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Ride Details Not Found</h1>
        <p className="text-gray-600 mb-8">Please go back and select a ride from your activity.</p>
        <Button onClick={goBack} className="w-full max-w-xs h-12 bg-black text-white rounded-full">
          Go Back
        </Button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800"
      case "Scheduled":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-gray-100 text-gray-800"
      case "Canceled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <BackButton onClick={goBack} />
        <h1 className="text-xl font-bold text-gray-900">Ride Details</h1>
        <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          {/* Ride Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{rideDetails.title}</h2>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(rideDetails.status)}`}
              >
                {rideDetails.status}
              </span>
            </div>
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Date:</span> {formatDate(rideDetails.dateTime)}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Time:</span> {formatTime(rideDetails.dateTime)}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Pickup:</span> {rideDetails.pickupAddress}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Dropoff:</span> {rideDetails.dropoffAddress}
              </p>
            </div>
          </div>

          {/* Driver Info (if available) */}
          {rideDetails.driver && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-bold text-blue-800 mb-2">Driver Information</h2>
              <p className="text-blue-700">Driver: {rideDetails.driver.name}</p>
              <p className="text-blue-700">
                Vehicle: {rideDetails.driver.vehicle} ({rideDetails.driver.plate})
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-4 mb-6">
            {rideDetails.status === "Confirmed" && (
              <Button
                className="w-full h-12 bg-blue-600 text-white rounded-full text-base font-medium"
                onClick={() => onNavigate("during-ride")}
              >
                <Car className="h-5 w-5 mr-2" />
                Track Ride
              </Button>
            )}
            {rideDetails.status === "Scheduled" && (
              <Button
                className="w-full h-12 bg-black text-white rounded-full text-base font-medium"
                onClick={() => onNavigate("reserve-car")} // Example: navigate to reschedule flow
              >
                Reschedule Ride
              </Button>
            )}
            {(rideDetails.status === "Confirmed" || rideDetails.status === "Scheduled") && (
              <Button
                variant="destructive"
                className="w-full h-12 rounded-full text-base font-medium"
                onClick={() => alert("Cancelling ride...")}
              >
                Cancel Ride
              </Button>
            )}
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
