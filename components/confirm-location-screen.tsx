"use client"

import { motion } from "framer-motion"
import { Check, Home, Car, History, User } from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"
import BaseMap from "@/components/base-map"

interface ConfirmLocationScreenProps {
  onNavigate: (screen: Screen, data?: any) => void
  pickupLocation?: string
  dropoffLocation?: string
  pickupLatLng?: { lat: number; lng: number }
  dropoffLatLng?: { lat: number; lng: number }
  scheduledDate?: Date
  scheduledTime?: string
  isScheduled?: boolean
  goBack: () => void
}

interface AddressData {
  shortAddress: string
  displayName: string
}

interface RouteInfo {
  distance: number
  duration: number
}

const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY;

if (!ORS_API_KEY) {
  throw new Error("NEXT_PUBLIC_ORS_API_KEY is not set.");
}

export function ConfirmLocationScreen({
  onNavigate,
  pickupLocation = "My Location",
  dropoffLocation = "",
  pickupLatLng,
  dropoffLatLng,
  scheduledDate,
  scheduledTime,
  isScheduled = false,
  goBack,
}: ConfirmLocationScreenProps) {
  const [selectedLocation, setSelectedLocation] = useState<"pickup" | "dropoff" | null>(null)
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([])
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)

  const [adjustedPickup, setAdjustedPickup] = useState<AddressData>({
    shortAddress: pickupLocation,
    displayName: "",
  })
  const [adjustedDropoff, setAdjustedDropoff] = useState<AddressData>({
    shortAddress: dropoffLocation,
    displayName: "",
  })

  const [adjustedPickupCoords, setAdjustedPickupCoords] = useState(pickupLatLng)
  const [adjustedDropoffCoords, setAdjustedDropoffCoords] = useState(dropoffLatLng)

  // Use refs to store current coordinates to avoid state update loops
  const currentPickupCoordsRef = useRef(pickupLatLng)
  const currentDropoffCoordsRef = useRef(dropoffLatLng)
  const selectedLocationRef = useRef(selectedLocation)
  const addressUpdateTimeoutRef = useRef<NodeJS.Timeout>()
  const routeFetchTimeoutRef = useRef<NodeJS.Timeout>()
  const lastFetchedRouteRef = useRef<string>("")

  // Update refs when state changes
  useEffect(() => {
    currentPickupCoordsRef.current = adjustedPickupCoords
  }, [adjustedPickupCoords])

  useEffect(() => {
    currentDropoffCoordsRef.current = adjustedDropoffCoords
  }, [adjustedDropoffCoords])

  useEffect(() => {
    selectedLocationRef.current = selectedLocation
  }, [selectedLocation])

  const decodePolyline = (encoded: string): [number, number][] => {
    const coords = []
    let index = 0
    let lat = 0
    let lng = 0

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0
      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      const deltaLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
      lat += deltaLat

      shift = 0
      result = 0
      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      const deltaLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
      lng += deltaLng

      coords.push([lat / 1e5, lng / 1e5] as [number, number])
    }
    return coords
  }

  const reverseGeocode = useCallback(async (lat: number, lng: number, signal?: AbortSignal): Promise<AddressData> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { 
          signal: signal,
          headers: {
            'User-Agent': 'RideApp/1.0'
          }
        },
      )

      if (!response.ok) throw new Error(`Geocoding failed: ${response.status}`)
      const data = await response.json()
      
      const address = data.address || {}

      const houseNumber = address.house_number || ""
      const street = address.road || address.street || ""
      const city = address.city || address.town || address.village || address.hamlet || ""
      const state = address.state || ""
      const postcode = address.postcode || ""

      const shortAddress =
        [houseNumber, street].filter(Boolean).join(" ") || city || data.display_name?.split(",")[0] || "Unknown Address"

      const displayParts = []
      if (city && !shortAddress.includes(city)) displayParts.push(city)
      if (state) displayParts.push(state)
      if (postcode) displayParts.push(postcode)

      const displayName = displayParts.join(", ")

      return { shortAddress, displayName }
    } catch (error:any) {
      if (error.name !== 'AbortError') {
        console.warn("Reverse geocoding error:", error)
      }
      throw error
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchInitialAddresses = async () => {
      const promises = []

      if (pickupLatLng) {
        promises.push(reverseGeocode(pickupLatLng.lat, pickupLatLng.lng, controller.signal))
      } else {
        promises.push(Promise.resolve({ shortAddress: pickupLocation, displayName: "" }))
      }

      if (dropoffLatLng) {
        promises.push(reverseGeocode(dropoffLatLng.lat, dropoffLatLng.lng, controller.signal))
      } else {
        promises.push(Promise.resolve({ shortAddress: dropoffLocation, displayName: "" }))
      }

      try {
        const [pickupAddressData, dropoffAddressData] = await Promise.all(promises)
        
        if (isMounted) {
          setAdjustedPickup({
            shortAddress: pickupLocation,
            displayName: pickupAddressData.displayName,
          })
          setAdjustedDropoff({
            shortAddress: dropoffLocation,
            displayName: dropoffAddressData.displayName,
          })
        }
      } catch (error:any) {
        if (error.name !== 'AbortError') {
          console.warn("Failed to fetch initial addresses:", error)
        }
      }
    }

    fetchInitialAddresses()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [pickupLatLng, dropoffLatLng, pickupLocation, dropoffLocation, reverseGeocode])


  const fetchRoute = useCallback(
    async (pickup: { lat: number; lng: number }, dropoff: { lat: number; lng: number }) => {
      const routeKey = `${pickup.lat.toFixed(6)},${pickup.lng.toFixed(6)}-${dropoff.lat.toFixed(6)},${dropoff.lng.toFixed(6)}`

      if (lastFetchedRouteRef.current === routeKey) {
        return
      }

      lastFetchedRouteRef.current = routeKey
      setIsLoadingRoute(true)

      try {
        const requestBody = {
          coordinates: [
            [pickup.lng, pickup.lat],
            [dropoff.lng, dropoff.lat],
          ],
        }

        const response = await fetch("https://api.openrouteservice.org/v2/directions/driving-car", {
          method: "POST",
          headers: {
            Authorization: ORS_API_KEY, // Use the environment variable here
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          throw new Error(`ORS API error: ${response.status}`)
        }

        const data = await response.json()
        const route = data.routes?.[0]

        if (route && route.geometry) {
          const coordinates = decodePolyline(route.geometry)
          setRouteCoordinates(coordinates)
          setRouteInfo({
            distance: route.summary.distance,
            duration: route.summary.duration,
          })
        } else {
          throw new Error("No route returned from ORS")
        }
      } catch (error) {
        console.warn("Route fetching failed:", error)
        setRouteCoordinates([
          [pickup.lat, pickup.lng],
          [dropoff.lat, dropoff.lng],
        ])
      } finally {
        setIsLoadingRoute(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (adjustedPickupCoords && adjustedDropoffCoords) {
      if (routeFetchTimeoutRef.current) {
        clearTimeout(routeFetchTimeoutRef.current)
      }

      routeFetchTimeoutRef.current = setTimeout(() => {
        fetchRoute(adjustedPickupCoords, adjustedDropoffCoords)
      }, 200)
    } else {
      setRouteCoordinates([])
      setRouteInfo(null)
    }

    return () => {
      if (routeFetchTimeoutRef.current) {
        clearTimeout(routeFetchTimeoutRef.current)
      }
    }
  }, [adjustedPickupCoords, adjustedDropoffCoords, fetchRoute])

  const getMapCenter = (): [number, number] => {
    if (selectedLocation === "pickup" && adjustedPickupCoords) {
      return [adjustedPickupCoords.lat, adjustedPickupCoords.lng]
    }
    if (selectedLocation === "dropoff" && adjustedDropoffCoords) {
      return [adjustedDropoffCoords.lat, adjustedDropoffCoords.lng]
    }
    if (adjustedPickupCoords && adjustedDropoffCoords) {
      return [
        (adjustedPickupCoords.lat + adjustedDropoffCoords.lat) / 2,
        (adjustedPickupCoords.lng + adjustedDropoffCoords.lng) / 2,
      ]
    }
    if (adjustedDropoffCoords) return [adjustedDropoffCoords.lat, adjustedDropoffCoords.lng]
    if (adjustedPickupCoords) return [adjustedPickupCoords.lat, adjustedPickupCoords.lng]
    return [40.7128, -74.006]
  }

  const getMapZoom = (): number => (selectedLocation ? 18 : 14)

  const getMarkers = () => {
    const markers = []
    if (!selectedLocation) {
      if (adjustedPickupCoords)
        markers.push({
          lat: adjustedPickupCoords.lat,
          lng: adjustedPickupCoords.lng,
          type: "pickup" as const,
        })
      if (adjustedDropoffCoords)
        markers.push({
          lat: adjustedDropoffCoords.lat,
          lng: adjustedDropoffCoords.lng,
          type: "dropoff" as const,
        })
    }
    return markers
  }

  const getMapBounds = (): [[number, number], [number, number]] | undefined => {
    if (adjustedPickupCoords && adjustedDropoffCoords && !selectedLocation) {
      const latDiff = Math.abs(adjustedPickupCoords.lat - adjustedDropoffCoords.lat)
      const lngDiff = Math.abs(adjustedPickupCoords.lng - adjustedDropoffCoords.lng)

      const padding = Math.max(latDiff, lngDiff) * 0.3 || 0.01

      const southWest: [number, number] = [
        Math.min(adjustedPickupCoords.lat, adjustedDropoffCoords.lat) - padding,
        Math.min(adjustedPickupCoords.lng, adjustedDropoffCoords.lng) - padding,
      ]
      const northEast: [number, number] = [
        Math.max(adjustedPickupCoords.lat, adjustedDropoffCoords.lat) + padding,
        Math.max(adjustedPickupCoords.lng, adjustedDropoffCoords.lng) + padding,
      ]
      return [southWest, northEast]
    }
    return undefined
  }

  const handleLocationSelect = (locationType: "pickup" | "dropoff") => {
    setSelectedLocation(locationType)
  }

  const handleMapCenterChange = useCallback((lat: number, lng: number) => {
    const currentSelected = selectedLocationRef.current
    if (!currentSelected) return

    const newCoords = { lat, lng }
    if (currentSelected === "pickup") {
      currentPickupCoordsRef.current = newCoords
      setAdjustedPickupCoords(newCoords)
    } else if (currentSelected === "dropoff") {
      currentDropoffCoordsRef.current = newCoords
      setAdjustedDropoffCoords(newCoords)
    }

    if (addressUpdateTimeoutRef.current) {
      clearTimeout(addressUpdateTimeoutRef.current)
    }

    addressUpdateTimeoutRef.current = setTimeout(async () => {
      const selectedAtTime = selectedLocationRef.current
      if (!selectedAtTime || selectedAtTime !== currentSelected) return

      try {
        const addressData = await reverseGeocode(lat, lng)
        if (selectedAtTime === "pickup") {
          setAdjustedPickup(addressData)
        } else if (selectedAtTime === "dropoff") {
          setAdjustedDropoff(addressData)
        }
      } catch (error) {
        console.warn("Address lookup failed:", error)
        const fallbackAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        const fallbackData = { shortAddress: fallbackAddress, displayName: "Coordinates" }

        if (selectedAtTime === "pickup") {
          setAdjustedPickup(fallbackData)
        } else if (selectedAtTime === "dropoff") {
          setAdjustedDropoff(fallbackData)
        }
      }
    }, 200)
  }, [reverseGeocode])

  useEffect(() => {
    return () => {
      if (addressUpdateTimeoutRef.current) {
        clearTimeout(addressUpdateTimeoutRef.current)
      }
      if (routeFetchTimeoutRef.current) {
        clearTimeout(routeFetchTimeoutRef.current)
      }
    }
  }, [])

  const handleConfirm = () => {
    onNavigate("choose-ride", {
      pickupLocation: adjustedPickup.shortAddress,
      dropoffLocation: adjustedDropoff.shortAddress,
      pickupLatLng: adjustedPickupCoords,
      dropoffLatLng: adjustedDropoffCoords,
      routeInfo: routeInfo,
      routeCoordinates: routeCoordinates,
      isScheduled,
      scheduledDate,
      scheduledTime,
    })
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="px-4 py-4 h-screen flex flex-col pb-20">
        <BackButton onClick={goBack} className="mb-4" />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirm your trip</h1>
          <p className="text-gray-600 mb-6">
            {selectedLocation
              ? "Drag the map to position the pin at your desired location"
              : "Tap a location below to adjust it on the map"}
          </p>

          <div className="bg-white rounded-xl shadow-sm mb-6 h-64 overflow-hidden relative">
            <BaseMap
              center={getMapCenter()}
              markers={getMarkers()}
              polylines={[]}
              zoom={getMapZoom()}
              bounds={selectedLocation ? undefined : getMapBounds()}
              showCenterPin={false}
              onMapMove={handleMapCenterChange}
            />

            {selectedLocation && (
              <div
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                style={{ zIndex: 9999 }}
              >
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${
                      selectedLocation === "pickup" ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="w-0.5 h-4 bg-gray-600"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="space-y-4">
              <button
                onClick={() => handleLocationSelect("pickup")}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 relative ${
                  selectedLocation === "pickup"
                    ? "bg-green-50 border-green-300 shadow-md"
                    : "hover:bg-gray-50 border-transparent hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-sm text-gray-500 mb-1">Pickup location</p>
                    <p className="font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                      {adjustedPickup.shortAddress}
                    </p>
                    {adjustedPickup.displayName && (
                      <p className="text-sm text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                        {adjustedPickup.displayName}
                      </p>
                    )}
                  </div>
                </div>
                {selectedLocation === "pickup" && (
                  <div className="absolute top-3 right-3 text-green-600 text-xs font-medium bg-green-100 px-1.5 py-1 rounded-full whitespace-nowrap">
                    Drag map to adjust
                  </div>
                )}
              </button>

              <button
                onClick={() => handleLocationSelect("dropoff")}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 relative ${
                  selectedLocation === "dropoff"
                    ? "bg-red-50 border-red-300 shadow-md"
                    : "hover:bg-gray-50 border-transparent hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-sm mt-2 flex-shrink-0"></div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-sm text-gray-500 mb-1">Destination</p>
                    <p className="font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                      {adjustedDropoff.shortAddress || "Not set"}
                    </p>
                    {adjustedDropoff.displayName && (
                      <p className="text-sm text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                        {adjustedDropoff.displayName}
                      </p>
                    )}
                  </div>
                </div>
                {selectedLocation === "dropoff" && (
                  <div className="absolute top-3 right-3 text-red-600 text-xs font-medium bg-red-100 px-1.5 py-1 rounded-full whitespace-nowrap">
                    Drag map to adjust
                  </div>
                )}
              </button>
            </div>
          </div>

          <div className="mt-auto">
            <button
              onClick={handleConfirm}
              disabled={!adjustedDropoff.shortAddress}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Check className="h-5 w-5" />
              Continue to ride selection
            </button>
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
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