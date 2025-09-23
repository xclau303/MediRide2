"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Phone, MessageCircle, ArrowLeft, Home, Car, History, User } from "lucide-react"
import type { Screen } from "@/app/page"
import BaseMap from "@/components/base-map"
import type { RideSimulation } from "@/types/driver"
import { simulateDriverMovement, getSimulationConfig } from "@/lib/driver-simulation"

interface DuringRideScreenProps {
  onNavigate: (screen: Screen) => void
  pickupLocation?: string
  dropoffLocation?: string
  pickupLatLng?: { lat: number; lng: number }
  dropoffLatLng?: { lat: number; lng: number }
  rideSimulation?: RideSimulation | null
  setRideSimulation?: (simulation: RideSimulation | null) => void
}

export function DuringRideScreen({
  onNavigate,
  pickupLocation,
  dropoffLocation,
  pickupLatLng,
  dropoffLatLng,
  rideSimulation,
  setRideSimulation,
}: DuringRideScreenProps) {
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [driverPosition, setDriverPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [rideProgress, setRideProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(12) // Minutes
  const [distanceRemaining, setDistanceRemaining] = useState("3.2 miles")
  const dragRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const initialDragY = useRef(0)
  const cleanupMovement = useRef<(() => void) | null>(null)

  const config = getSimulationConfig()

  const driverInfo = rideSimulation?.driver
    ? {
        name: rideSimulation.driver.name,
        vehicle: `${rideSimulation.driver.vehicle.color} ${rideSimulation.driver.vehicle.make} ${rideSimulation.driver.vehicle.model}`,
        plate: rideSimulation.driver.vehicle.plate,
        rating: rideSimulation.driver.rating.toString(),
        photo: rideSimulation.driver.avatar,
      }
    : {
        name: "Michael Johnson",
        vehicle: "Green Honda Accord",
        plate: "GDR824",
        rating: "4.9",
        photo: "/placeholder.svg?height=60&width=60",
      }

  const rideDetails = {
    pickup: pickupLocation || "Current Location",
    destination: dropoffLocation || "Destination",
    eta: `${timeRemaining} min`,
    distance: distanceRemaining,
  }

  useEffect(() => {
    console.log("[v0] During ride effect - rideSimulation:", rideSimulation)
    if (rideSimulation?.trip_route && rideSimulation.trip_route.length > 0) {
      console.log("[v0] Starting driver movement simulation with", rideSimulation.trip_route.length, "route points")
      const startPosition = rideSimulation.trip_route[0]
      setDriverPosition({ lat: startPosition[0], lng: startPosition[1] })

      const routeLength = rideSimulation.trip_route.length
      const estimatedMinutes = Math.ceil(routeLength / 10)
      setTimeRemaining(Math.max(5, Math.min(30, estimatedMinutes)))

      const cleanup = simulateDriverMovement(rideSimulation.trip_route, config.rideDuration, (position, progress) => {
        console.log("[v0] Driver position updated:", position, "Progress:", progress)
        setDriverPosition(position)
        setRideProgress(progress)

        const remainingTime = Math.ceil(estimatedMinutes * (1 - progress))
        setTimeRemaining(Math.max(1, remainingTime))

        const remainingDistance = (3.2 * (1 - progress)).toFixed(1)
        setDistanceRemaining(`${remainingDistance} miles`)
      })

      cleanupMovement.current = cleanup

      const timer = setTimeout(() => {
        if (setRideSimulation) {
          setRideSimulation({
            ...rideSimulation,
            status: "completed",
            progress: 1,
          })
        }
        onNavigate("post-ride")
      }, config.rideDuration)

      return () => {
        if (cleanup) cleanup()
        clearTimeout(timer)
      }
    } else {
      console.log("[v0] No trip route available, using fallback positioning")
      if (pickupLatLng && dropoffLatLng) {
        const currentLat = pickupLatLng.lat + (dropoffLatLng.lat - pickupLatLng.lat) * 0.3
        const currentLng = pickupLatLng.lng + (dropoffLatLng.lng - pickupLatLng.lng) * 0.3
        setDriverPosition({ lat: currentLat, lng: currentLng })
      }

      const timer = setTimeout(() => {
        onNavigate("post-ride")
      }, config.rideDuration)

      return () => clearTimeout(timer)
    }
  }, [
    rideSimulation,
    onNavigate,
    pickupLocation,
    dropoffLocation,
    pickupLatLng,
    dropoffLatLng,
    setRideSimulation,
    config.rideDuration,
  ])

  useEffect(() => {
    return () => {
      if (cleanupMovement.current) {
        cleanupMovement.current()
      }
    }
  }, [])

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

    const maxDrag = 150
    setDragY(Math.max(0, Math.min(maxDrag, newDragY)))
  }

  const handleDragEnd = () => {
    setIsDragging(false)

    const snapThreshold = 75
    if (dragY > snapThreshold) {
      setDragY(150)
    } else {
      setDragY(0)
    }
  }

  useEffect(() => {
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

  const getMapCenter = (): [number, number] => {
    if (driverPosition) return [driverPosition.lat, driverPosition.lng]
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
      })
    }

    if (dropoffLatLng) {
      markers.push({
        lat: dropoffLatLng.lat,
        lng: dropoffLatLng.lng,
        type: "dropoff" as const,
        label: dropoffLocation || "Destination", // Keep destination label
      })
    }

    if (driverPosition) {
      markers.push({
        lat: driverPosition.lat,
        lng: driverPosition.lng,
        type: "driver" as const,
      })
    }

    return markers
  }

  const getPolylines = (): [number, number][] => {
    if (rideSimulation?.trip_route && rideSimulation.trip_route.length > 0) {
      console.log("[v0] Trip route available with", rideSimulation.trip_route.length, "points")
      return rideSimulation.trip_route
    }

    console.log("[v0] No trip route, falling back to straight line")
    if (pickupLatLng && dropoffLatLng) {
      return [
        [pickupLatLng.lat, pickupLatLng.lng],
        [dropoffLatLng.lat, dropoffLatLng.lng],
      ]
    }
    return []
  }

  const getMapBounds = (): [[number, number], [number, number]] | undefined => {
    if (driverPosition && dropoffLatLng) {
      const latDiff = Math.abs(driverPosition.lat - dropoffLatLng.lat)
      const lngDiff = Math.abs(driverPosition.lng - dropoffLatLng.lng)
      const padding = Math.max(latDiff, lngDiff) * 0.3 || 0.01

      const southWest: [number, number] = [
        Math.min(driverPosition.lat, dropoffLatLng.lat) - padding,
        Math.min(driverPosition.lng, dropoffLatLng.lng) - padding,
      ]
      const northEast: [number, number] = [
        Math.max(driverPosition.lat, dropoffLatLng.lat) + padding,
        Math.max(driverPosition.lng, dropoffLatLng.lng) + padding,
      ]
      return [southWest, northEast]
    }
    return undefined
  }

  return (
    <div className="relative bg-gray-100 min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <BaseMap
          center={getMapCenter()}
          markers={getMarkers()}
          polylines={getPolylines()}
          bounds={getMapBounds()}
          zoom={13}
          hideDriverLabels={true}
        />
      </div>

      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => onNavigate("dashboard")}
          className="bg-white bg-opacity-90 text-gray-800 p-3 rounded-full hover:bg-opacity-100 transition-all shadow-lg border"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

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
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          style={{ touchAction: "none" }}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors"></div>
        </div>

        <div className="px-6 pb-6 h-full overflow-y-auto">
          <div className="text-center mb-4">
            <div className="text-lg font-semibold text-gray-800 mb-2">
              Arriving at {dropoffLocation || "your destination"}
            </div>
            <div className="text-sm text-gray-600 mb-3">
              {rideDetails.eta} • {rideDetails.distance}
            </div>

            {rideProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${rideProgress * 100}%` }}
                ></div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-4">
              <img
                src={driverInfo.photo || "/placeholder.svg"}
                alt="Driver"
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=48&width=48"
                }}
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
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-full border-gray-300 text-gray-700 bg-transparent"
              onClick={() => onNavigate("driver-chat")}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Message
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-gray-300 text-gray-700 bg-transparent"
              onClick={() => alert("Calling driver...")}
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-gray-300 text-gray-700 bg-transparent"
              onClick={() => alert("Emergency contact...")}
            >
              <span className="text-lg">🚨</span>
            </Button>
          </div>
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
