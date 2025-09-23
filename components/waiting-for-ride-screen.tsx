"use client"

import React from "react"
import BaseMap from "@/components/base-map"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Phone, MessageCircle, ArrowLeft, Home, Car, History, User } from "lucide-react"
import type { Screen } from "@/app/page"
import type { RideSimulation } from "@/types/driver"
import { simulateDriverMovement, getSimulationConfig } from "@/lib/driver-simulation"

interface WaitingForRideScreenProps {
  onNavigate: (screen: Screen, data?: any) => void
  pickupLocation?: string
  dropoffLocation?: string
  pickupLatLng?: { lat: number; lng: number }
  dropoffLatLng?: { lat: number; lng: number }
  rideSimulation?: RideSimulation | null
  setRideSimulation?: (simulation: RideSimulation | null) => void
}

export function WaitingForRideScreen({
  onNavigate,
  pickupLocation = "Current Location", // Updated default fallback
  dropoffLocation,
  pickupLatLng,
  dropoffLatLng,
  rideSimulation,
  setRideSimulation,
}: WaitingForRideScreenProps) {
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [driverPosition, setDriverPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(2) // Minutes
  const [approachProgress, setApproachProgress] = useState(0)
  const [isPulsing, setIsPulsing] = useState(true)
  const dragRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const initialDragY = useRef(0)
  const cleanupMovement = useRef<(() => void) | null>(null)

  const config = getSimulationConfig()

  useEffect(() => {
    if (rideSimulation?.driver && rideSimulation.approach_route.length > 0) {
      const startPosition = rideSimulation.approach_route[0]
      setDriverPosition({ lat: startPosition[0], lng: startPosition[1] })

      const initialETA = Math.ceil(rideSimulation.driver.eta / 60)
      setTimeRemaining(Math.max(1, Math.min(10, initialETA)))

      const cleanup = simulateDriverMovement(
        rideSimulation.approach_route,
        config.waitingDuration,
        (position, progress) => {
          setDriverPosition(position)
          setApproachProgress(progress)
          const remainingTime = Math.ceil(initialETA * (1 - progress))
          setTimeRemaining(Math.max(1, remainingTime))
          if (progress > 0.8) {
            setIsPulsing(false)
          }
        },
      )

      cleanupMovement.current = cleanup

      const timer = setTimeout(() => {
        if (setRideSimulation && rideSimulation) {
          setRideSimulation({
            ...rideSimulation,
            status: "in_progress",
            progress: 0,
          })
        }
        onNavigate("during-ride", {
          pickupLocation,
          dropoffLocation,
          pickupLatLng,
          dropoffLatLng,
        })
      }, config.waitingDuration)

      return () => {
        if (cleanup) cleanup()
        clearTimeout(timer)
      }
    }
  }, [
    rideSimulation,
    onNavigate,
    pickupLocation,
    dropoffLocation,
    pickupLatLng,
    dropoffLatLng,
    setRideSimulation,
    config.waitingDuration,
  ])

  useEffect(() => {
    return () => {
      if (cleanupMovement.current) {
        cleanupMovement.current()
      }
    }
  }, [])

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

  const getMapCenter = (): [number, number] => {
    if (driverPosition) return [driverPosition.lat, driverPosition.lng]
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
        label: pickupLocation || "Current Location",
      })
    }

    if (driverPosition && driverInfo) {
      markers.push({
        lat: driverPosition.lat,
        lng: driverPosition.lng,
        type: "driver" as const,
      })
    }

    return markers
  }

  const getPolylines = (): [number, number][] => {
    if (rideSimulation?.approach_route && rideSimulation.approach_route.length > 0) {
      return rideSimulation.approach_route
    }
    return []
  }

  const getMapBounds = (): [[number, number], [number, number]] | undefined => {
    if (pickupLatLng && driverPosition) {
      const latDiff = Math.abs(pickupLatLng.lat - driverPosition.lat)
      const lngDiff = Math.abs(pickupLatLng.lng - driverPosition.lng)
      const padding = Math.max(latDiff, lngDiff) * 0.3 || 0.01

      const southWest: [number, number] = [
        Math.min(pickupLatLng.lat, driverPosition.lat) - padding,
        Math.min(pickupLatLng.lng, driverPosition.lng) - padding,
      ]
      const northEast: [number, number] = [
        Math.max(pickupLatLng.lat, driverPosition.lat) + padding,
        Math.max(pickupLatLng.lng, driverPosition.lng) + padding,
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
          zoom={15}
          hideDriverLabels={true}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute top-20 left-4 flex gap-2"
      >
        <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 backdrop-blur-sm bg-white/95">
          <span className="text-gray-800 font-medium flex items-center gap-2">
            <div className={`w-2 h-2 bg-blue-500 rounded-full ${isPulsing ? "animate-pulse" : ""}`}></div>
            {pickupLocation || "Pickup spot"}
          </span>
        </div>
        <button className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 backdrop-blur-sm bg-white/95">
          <span className="text-blue-600 font-medium">Change</span>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 200 }}
        className="absolute top-32 right-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white px-6 py-4 rounded-2xl text-center shadow-xl border border-blue-500/20"
      >
        <motion.div
          key={timeRemaining}
          initial={{ scale: 1.2, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold leading-tight"
        >
          {timeRemaining}
        </motion.div>
        <div className="text-sm font-medium opacity-90">min</div>
      </motion.div>

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
        style={{ height: "45vh" }}
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6"
          >
            <h1 className="text-xl font-semibold text-gray-800 mb-2">{driverInfo.name} is Arriving in</h1>
            <motion.div
              key={timeRemaining}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-bold text-gray-800 mb-3"
            >
              {timeRemaining} min
            </motion.div>
            {approachProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-3 mt-3 overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${approachProgress * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 h-3 rounded-full shadow-sm"
                ></motion.div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 mb-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-4">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                src={driverInfo.photo || "/placeholder.svg"}
                alt="Driver"
                className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-white"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=64&width=64"
                }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-semibold text-gray-800">{driverInfo.rating}</span>
                  <span className="text-yellow-500 text-lg">★</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">{driverInfo.plate}</div>
                <div className="text-gray-600 font-medium">{driverInfo.vehicle}</div>
              </div>
              <motion.img
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                src="/classic-red-convertible.png"
                alt="Vehicle"
                className="w-20 h-12 object-cover rounded-lg shadow-sm"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex gap-3"
          >
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-full border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
              onClick={() => onNavigate("driver-chat")}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Send a message
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
              onClick={() => alert("Calling driver...")}
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
              onClick={() => alert("Emergency contact...")}
            >
              <span className="text-lg">🚨</span>
            </Button>
          </motion.div>
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
