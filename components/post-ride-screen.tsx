"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Star, ArrowLeft, CheckCircle, Home, Car, History, User } from "lucide-react"
import type { Screen } from "@/app/page"

interface PostRideScreenProps {
  onNavigate: (screen: Screen) => void
  tripData?: {
    pickupLocation?: string
    dropoffLocation?: string
    driverName?: string
    driverVehicle?: string
    driverPlate?: string
    driverPhoto?: string
    driverRating?: string
    fare?: string
    distance?: string
    duration?: string
  }
  pickupLocation?: string
  dropoffLocation?: string
  rideSimulation?: any
  pickupLatLng?: { lat: number; lng: number }
  dropoffLatLng?: { lat: number; lng: number }
}

export function PostRideScreen({
  onNavigate,
  tripData,
  pickupLocation,
  dropoffLocation,
  rideSimulation,
  pickupLatLng,
  dropoffLatLng,
}: PostRideScreenProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState("")

  const driverInfo = {
    name: rideSimulation?.driver?.name || tripData?.driverName || "Michael Johnson",
    vehicle: rideSimulation?.driver
      ? `${rideSimulation.driver.vehicle.color} ${rideSimulation.driver.vehicle.make} ${rideSimulation.driver.vehicle.model}`
      : tripData?.driverVehicle || "Green Honda Accord",
    plate: rideSimulation?.driver?.vehicle?.plate || tripData?.driverPlate || "GDR824",
    photo: rideSimulation?.driver?.avatar || tripData?.driverPhoto || "/placeholder.svg?height=80&width=80",
    rating: rideSimulation?.driver?.rating?.toString() || tripData?.driverRating || "4.9",
  }

  const actualDestination = dropoffLocation || tripData?.dropoffLocation
  const displayDestination =
    actualDestination && actualDestination !== "Destination" ? actualDestination : "your destination"

  const rideDetails = {
    pickup: pickupLocation || tripData?.pickupLocation || "Current Location",
    destination: displayDestination,
    fare: tripData?.fare || "$15.00",
    distance: tripData?.distance || "3.2 miles",
    duration: tripData?.duration || "12 min",
  }

  const handleRatingClick = (value: number) => {
    setRating(value)
  }

  const handleSubmitRating = () => {
    // Handle rating submission
    console.log("Rating submitted:", { rating, feedback })
    onNavigate("dashboard")
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 flex items-center">
        <button
          onClick={() => onNavigate("dashboard")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 ml-4">Trip Complete</h1>
      </div>

      <div className="px-6 py-6">
        {/* Arrival confirmation */}
        <div className="text-center mb-8">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">You've arrived!</h2>
          <p className="text-gray-600">
            Hope you had a safe trip to{" "}
            {actualDestination && actualDestination !== "Destination" ? actualDestination : "your destination"}
          </p>
        </div>

        {/* Trip summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Trip Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Distance</span>
              <span className="text-gray-800">{rideDetails.distance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration</span>
              <span className="text-gray-800">{rideDetails.duration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fare</span>
              <span className="text-gray-800 font-semibold">{rideDetails.fare}</span>
            </div>
          </div>
        </div>

        {/* Driver info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={driverInfo.photo || "/placeholder.svg"}
              alt="Driver"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-800">{driverInfo.name}</div>
              <div className="text-sm text-gray-600">
                {driverInfo.vehicle} • {driverInfo.plate}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm font-medium">{driverInfo.rating}</span>
                <span className="text-yellow-500 text-sm">★</span>
              </div>
            </div>
          </div>

          {/* Rating section */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-800 mb-3">Rate your driver</h4>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Feedback textarea */}
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Leave feedback for your driver (optional)"
              className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleSubmitRating}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            disabled={rating === 0}
          >
            Submit Rating
          </Button>
          <Button
            onClick={() => onNavigate("dashboard")}
            variant="outline"
            className="w-full h-12 border-gray-300 text-gray-700 rounded-lg font-medium"
          >
            Skip for Now
          </Button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around py-2">
          <button onClick={() => onNavigate("dashboard")} className="flex flex-col items-center text-blue-600">
            <Home className="h-6 w-6 mb-1" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => onNavigate("set-location")}
            className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Car className="h-6 w-6 mb-1" />
            <span className="text-xs">Book</span>
          </button>
          <button
            onClick={() => onNavigate("ride-activity")}
            className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <History className="h-6 w-6 mb-1" />
            <span className="text-xs">Activity</span>
          </button>
          <button
            onClick={() => onNavigate("profile")}
            className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <User className="h-6 w-6 mb-1" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}
