"use client";


import React from "react"
import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Car, Accessibility, ArrowLeft, Clock, Home, History, User } from "lucide-react"
import type { Screen } from "@/app/page"
import BaseMap from "@/components/base-map"
import { getAllVehiclePricing } from "@/lib/pricing"
import { createRideSimulation } from "@/lib/driver-simulation"
import type { RideSimulation, VehicleType } from "@/types/driver"

interface ChooseRideScreenProps {
  onNavigate: (screen: Screen, data?: any) => void
  pickupLocation?: string
  dropoffLocation?: string
  pickupLatLng?: { lat: number; lng: number }
  dropoffLatLng?: { lat: number; lng: number }
  scheduledDate?: string
  scheduledTime?: string
  isScheduled?: boolean
  onBookRide?: (rideData: any) => void
  goBack: () => void
  routeInfo?: { distance: number; duration: number } | null
  routeCoordinates?: [number, number][]
  currentRideSimulation?: RideSimulation | null
  setCurrentRideSimulation?: (simulation: RideSimulation | null) => void
}

export function ChooseRideScreen({
  onNavigate,
  pickupLocation,
  dropoffLocation,
  pickupLatLng,
  dropoffLatLng,
  scheduledDate,
  scheduledTime,
  isScheduled = false,
  onBookRide,
  goBack,
  routeInfo,
  routeCoordinates = [],
  currentRideSimulation,
  setCurrentRideSimulation,
}: ChooseRideScreenProps) {
  const [selectedRideType, setSelectedRideType] = useState<string | null>(null)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchAttempts, setSearchAttempts] = useState(0)
  const [searchMessage, setSearchMessage] = useState("")
  const dragRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const initialDragY = useRef(0)

  // Get all vehicle types with dynamic pricing
  const vehicleOptions = getAllVehiclePricing(routeInfo)

  const rideTypes = vehicleOptions.map((vehicle) => ({
    id: vehicle.id,
    name: vehicle.config.name,
    icon:
      vehicle.id === "standard" ? (
        <Car className="h-8 w-8 text-blue-600" />
      ) : (
        <Accessibility className="h-8 w-8 text-blue-600" />
      ),
    price: vehicle.pricing.price,
    eta: isScheduled ? null : vehicle.pricing.arrivalTime, // Don't show arrival time for scheduled rides
    awayTime: isScheduled ? null : vehicle.pricing.awayTime, // Don't show away time for scheduled rides
  }))

  const handleSelectRide = (id: string) => {
    setSelectedRideType(id)
  }

  const handleConfirmRide = async (isScheduledRide: boolean = isScheduled) => {
    if (!selectedRideType || !pickupLatLng || !dropoffLatLng) {
      alert("Please select a ride type and ensure locations are set.")
      return
    }

    const selectedRide = rideTypes.find((ride) => ride.id === selectedRideType)
    const vehicleType: VehicleType = selectedRideType === "accessible" ? "accessible" : "standard"

    const rideData = {
      pickupLocation,
      dropoffLocation,
      scheduledDate,
      scheduledTime,
      isScheduled: isScheduledRide,
      vehicleType: selectedRide?.name,
      price: selectedRide?.price, // This is the actual fare shown to user
      eta: selectedRide?.eta,
      routeInfo, // Pass the actual route info for distance/duration calculations
      pickupLatLng,
      dropoffLatLng,
    }

    // For scheduled rides, skip simulation and go directly to confirmation
    if (isScheduledRide) {
      if (onBookRide) {
        onBookRide(rideData)
      }

      onNavigate("reservation-confirmed", rideData)
      return
    }

    // For immediate rides, start driver simulation
    setIsSearching(true)
    setSearchAttempts(1)
    setSearchMessage("Finding your driver...")

    try {
      const simulation = await createRideSimulation(pickupLatLng, dropoffLatLng, vehicleType)

      if (simulation.driver) {
        // Driver found - set simulation and navigate to waiting screen
        if (setCurrentRideSimulation) {
          setCurrentRideSimulation(simulation)
        }

        if (onBookRide) {
          onBookRide(rideData)
        }

        onNavigate("waiting-for-ride", {
          ...rideData,
          pickupLatLng,
          dropoffLatLng,
        })
      } else {
        // No driver found - retry logic
        handleDriverSearchRetry()
      }
    } catch (error) {
      console.error("Driver search failed:", error)
      handleDriverSearchRetry()
    } finally {
      setIsSearching(false)
    }
  }

  const handleDriverSearchRetry = async () => {
    const maxAttempts = 3

    if (searchAttempts < maxAttempts) {
      // Retry search
      setSearchAttempts((prev) => prev + 1)
      setSearchMessage(`Searching again... (${searchAttempts + 1}/${maxAttempts})`)

      // Delay before retry
      setTimeout(() => {
        handleConfirmRide()
      }, 1000)
    } else {
      // Max attempts reached
      setSearchMessage("No drivers available at this time")
      setTimeout(() => {
        setIsSearching(false)
        setSearchAttempts(0)
        setSearchMessage("")
      }, 3000)
    }
  }

  const handleCancelSearch = () => {
    setIsSearching(false)
    setSearchAttempts(0)
    setSearchMessage("")
  }

  const handleDragStart = (event: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientY = "touches" in event ? event.touches[0].clientY : event.clientY
    startY.current = clientY
    initialDragY.current = dragY

    if ("touches" in event) {
      event.preventDefault()
    }
  }

  const handleDragMove = (event: MouseEvent | TouchEvent) => {
    if (!isDragging) return

    const clientY = "touches" in event ? event.touches[0].clientY : event.clientY
    const deltaY = clientY - startY.current
    const newDragY = initialDragY.current + deltaY

    const maxDrag = 120
    setDragY(Math.max(0, Math.min(maxDrag, newDragY)))
  }

  const handleDragEnd = () => {
    setIsDragging(false)

    const snapThreshold = 60
    if (dragY > snapThreshold) {
      setDragY(120)
    } else {
      setDragY(0)
    }
  }

  React.useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => handleDragMove(e)
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        handleDragMove(e)
      }
      const handleMouseUp = () => handleDragEnd()
      const handleTouchEnd = () => handleDragEnd()

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchend", handleTouchEnd)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [isDragging, dragY])

  const formatScheduledDate = () => {
    if (!scheduledDate || !scheduledTime) return ""

    const date = new Date(scheduledDate)

    let timeString = scheduledTime
    if (scheduledTime.includes(":") && !scheduledTime.includes("AM") && !scheduledTime.includes("PM")) {
      // Convert 24-hour format to 12-hour format
      const [hours, minutes] = scheduledTime.split(":")
      const hour24 = Number.parseInt(hours)
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
      const ampm = hour24 >= 12 ? "PM" : "AM"
      timeString = `${hour12}:${minutes} ${ampm}`
    }

    return `${date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at ${timeString}`
  }

  const getMapCenter = (): [number, number] => {
    if (pickupLatLng && dropoffLatLng) {
      return [(pickupLatLng.lat + dropoffLatLng.lat) / 2, (pickupLatLng.lng + dropoffLatLng.lng) / 2]
    }
    if (dropoffLatLng) return [dropoffLatLng.lat, dropoffLatLng.lng]
    if (pickupLatLng) return [pickupLatLng.lat, pickupLatLng.lng]
    return [40.7128, -74.006]
  }

  const getMarkers = () => {
    const markers = []
    if (pickupLatLng) {
      markers.push({
        lat: pickupLatLng.lat,
        lng: pickupLatLng.lng,
        type: "pickup" as const,
        label: pickupLocation || "Pickup Location",
      })
    }
    if (dropoffLatLng) {
      markers.push({
        lat: dropoffLatLng.lat,
        lng: dropoffLatLng.lng,
        type: "dropoff" as const,
        label: dropoffLocation || "Destination",
      })
    }
    return markers
  }

  const getPolylines = (): [number, number][] => {
    if (routeCoordinates && Array.isArray(routeCoordinates) && routeCoordinates.length >= 2) {
      return routeCoordinates
    }

    if (pickupLatLng && dropoffLatLng) {
      return [
        [pickupLatLng.lat, pickupLatLng.lng],
        [dropoffLatLng.lat, dropoffLatLng.lng],
      ]
    }
    return []
  }

  const getMapBounds = (): [[number, number], [number, number]] | undefined => {
    if (pickupLatLng && dropoffLatLng) {
      const latDiff = Math.abs(pickupLatLng.lat - dropoffLatLng.lat)
      const lngDiff = Math.abs(pickupLatLng.lng - dropoffLatLng.lng)
      const padding = Math.max(latDiff, lngDiff) * 0.3 || 0.01

      const southWest: [number, number] = [
        Math.min(pickupLatLng.lat, dropoffLatLng.lat) - padding,
        Math.min(pickupLatLng.lng, dropoffLatLng.lng) - padding,
      ]
      const northEast: [number, number] = [
        Math.max(pickupLatLng.lat, dropoffLatLng.lat) + padding,
        Math.max(pickupLatLng.lng, dropoffLatLng.lng) + padding,
      ]
      return [southWest, northEast]
    }
    return undefined
  }

  const selectedRideName = selectedRideType === "standard" ? "Standard Ride" : "Wheelchair Van"

  return (
    <div className="relative bg-gray-100 min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <BaseMap
          center={getMapCenter()}
          markers={getMarkers()}
          polylines={getPolylines()}
          bounds={getMapBounds()}
          zoom={12}
        />
      </div>

      {/* Back button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={goBack}
          className="bg-white bg-opacity-90 text-gray-800 p-3 rounded-full hover:bg-opacity-100 transition-all shadow-lg border"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      {isSearching && (
        <div className="absolute inset-0 bg-gray-100 z-30">
          <div className="h-full flex flex-col">
            {/* Map with pickup location pinned */}
            <div className="flex-1 relative">
              <BaseMap
                center={pickupLatLng ? [pickupLatLng.lat, pickupLatLng.lng] : getMapCenter()}
                markers={[
                  ...(pickupLatLng
                    ? [
                        {
                          lat: pickupLatLng.lat,
                          lng: pickupLatLng.lng,
                          type: "pickup" as const,
                          label: pickupLocation || "Pickup Location",
                        },
                      ]
                    : []),
                ]}
                polylines={[]}
                zoom={15}
              />

              {/* Address overlay matching the design */}
              <div className="absolute top-20 left-4 right-4">
                <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-600">Pickup location</p>
                      <p className="font-semibold text-gray-900">{pickupLocation || "7 Sherwood Avenue"}</p>
                      <p className="text-sm text-gray-500">Village of Ossining, New York, 10562</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom section with loading and cancel matching the design */}
            <div className="bg-white rounded-t-3xl p-6 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Looking for a driver...</h2>
                <p className="text-gray-600 mb-6">We're matching you with the nearest available driver.</p>

                {/* Animated loading dots */}
                <div className="flex justify-center gap-2 mb-8">
                  <div
                    className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>

              <Button
                onClick={handleCancelSearch}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Cancel Request
              </Button>
            </div>
          </div>
        </div>
      )}

      <motion.div
        ref={dragRef}
        animate={{ y: dragY }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 300,
          duration: isDragging ? 0 : 0.3,
        }}
        className="absolute bottom-0 left-0 right-0 bg-white text-gray-800 rounded-t-3xl shadow-2xl z-10 border-t"
        style={{ height: "50vh" }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          style={{ touchAction: "none" }}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors"></div>
        </div>

        <div className="px-6 pb-6 h-full overflow-y-auto">
          <h1 className="text-xl font-bold text-gray-800 mb-4 text-center">Choose a ride</h1>

          {/* Ride options */}
          <div className="space-y-3 mb-6">
            {rideTypes.map((type) => (
              <Card
                key={type.id}
                className={`cursor-pointer bg-white border-gray-200 hover:bg-gray-50 transition-all ${
                  selectedRideType === type.id ? "border-blue-500 ring-2 ring-blue-200" : ""
                }`}
                onClick={() => handleSelectRide(type.id)}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">{type.icon}</div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-800">{type.name}</h2>
                      {!isScheduled && type.eta && (
                        <>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Arrival Time: {type.eta}
                          </p>
                          <p className="text-xs text-gray-600">{type.awayTime}</p>
                        </>
                      )}
                      {isScheduled && <p className="text-xs text-gray-600">Scheduled ride</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-base font-bold text-gray-800">{type.price}</p>
                    {selectedRideType === type.id && <CheckCircle className="h-4 w-4 text-blue-600 mt-1" />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!isScheduled && (
            <Button
              onClick={() => handleConfirmRide(false)}
              disabled={!selectedRideType || isSearching}
              className="w-full h-12 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isSearching ? "Finding Driver..." : "Confirm Ride"}
            </Button>
          )}

          {isScheduled && (
            <Button
              onClick={() => handleConfirmRide(true)}
              disabled={!selectedRideType || isSearching}
              className="w-full h-10 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isSearching ? "Finding Driver..." : `Book ride for ${formatScheduledDate()}`}
            </Button>
          )}
        </div>
      </motion.div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="flex justify-around py-2">
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Home className="h-6 w-6 mb-1" />
            <span className="text-xs">Home</span>
          </button>
          <button onClick={() => onNavigate("set-location")} className="flex flex-col items-center text-blue-600">
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
