"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface LeafletMapProps {
  height?: string
  center?: [number, number]
  zoom?: number
  markers?: Array<{
    position: [number, number]
    popup?: string
    icon?: "default" | "pickup" | "destination" | "driver"
  }>
  onLocationSelect?: (lat: number, lng: number, address?: string) => void
  showCurrentLocation?: boolean
  interactive?: boolean
  className?: string
}

export default function LeafletMap({
  height = "350px",
  center = [51.505, -0.09],
  zoom = 13,
  markers = [],
  onLocationSelect,
  showCurrentLocation = false,
  interactive = true,
  className = "",
}: LeafletMapProps) {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (showCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setCurrentLocation([lat, lng])
        },
        (error) => {
          console.log("Geolocation error:", error)
        },
      )
    }
  }, [showCurrentLocation])

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onLocationSelect) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const lat = center[0] + (0.5 - y / rect.height) * 0.02
    const lng = center[1] + (x / rect.width - 0.5) * 0.02

    setSelectedLocation([lat, lng])
    onLocationSelect(lat, lng, `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
  }

  const getMarkerStyle = (markerType: string) => {
    switch (markerType) {
      case "pickup":
        return "bg-green-500 text-white"
      case "destination":
        return "bg-red-500 text-white"
      case "driver":
        return "bg-yellow-500 text-white"
      default:
        return "bg-blue-500 text-white"
    }
  }

  const getMarkerLabel = (markerType: string) => {
    switch (markerType) {
      case "pickup":
        return "P"
      case "destination":
        return "D"
      case "driver":
        return "🚗"
      default:
        return "📍"
    }
  }

  return (
    <div
      style={{ height, width: "100%" }}
      className={`relative rounded-lg overflow-hidden bg-gradient-to-br from-green-100 to-blue-100 ${className}`}
      onClick={handleMapClick}
    >
      <div className="absolute inset-0">
        <svg width="100%" height="100%" className="opacity-30">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Street lines */}
        <svg width="100%" height="100%" className="absolute inset-0 opacity-40">
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#64748b" strokeWidth="3" />
          <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#64748b" strokeWidth="3" />
          <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#64748b" strokeWidth="3" />
          <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#64748b" strokeWidth="3" />
        </svg>
      </div>

      {currentLocation && (
        <div
          className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{
            left: "50%",
            top: "50%",
          }}
        >
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
        </div>
      )}

      {selectedLocation && (
        <div
          className="absolute w-6 h-6 bg-purple-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center text-white text-xs font-bold"
          style={{
            left: "60%",
            top: "40%",
          }}
        >
          📍
        </div>
      )}

      {markers.map((marker, index) => (
        <div
          key={index}
          className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center text-xs font-bold ${getMarkerStyle(marker.icon || "default")}`}
          style={{
            left: `${30 + index * 20}%`,
            top: `${40 + index * 10}%`,
          }}
          title={marker.popup}
        >
          {getMarkerLabel(marker.icon || "default")}
        </div>
      ))}

      {interactive && (
        <div className="absolute inset-0 cursor-pointer">
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-gray-600 shadow-sm">
            {onLocationSelect ? "Tap to select location" : "Interactive Map"}
          </div>
        </div>
      )}

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
        © OpenStreetMap
      </div>
    </div>
  )
}
