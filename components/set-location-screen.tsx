"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { MapPin, Clock, ArrowUpDown, Home, Car, History, User } from "lucide-react"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface SetLocationScreenProps {
  onNavigate: (screen: Screen, data?: any) => void
  initialPickup?: string
  initialDropoff?: string
  goBack: () => void
}

interface Suggestion {
  displayName: string
  shortAddress: string
  fullAddress: string
  lat: number
  lon: number
}

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || "DFMEZ9oJiABz2fJX04KH"

export function SetLocationScreen({
  onNavigate,
  initialPickup = "",
  initialDropoff = "",
  goBack,
}: SetLocationScreenProps) {
  const [pickupLocation, setPickupLocation] = useState(initialPickup)
  const [dropoffLocation, setDropoffLocation] = useState(initialDropoff)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [pickupLatLng, setPickupLatLng] = useState<{ lat: number; lng: number } | null>(null)
  const [dropoffLatLng, setDropoffLatLng] = useState<{ lat: number; lng: number } | null>(null)
  const [activeInput, setActiveInput] = useState<"pickup" | "dropoff" | null>(null)
  const [pickupTiming, setPickupTiming] = useState<"now" | "later">("now")
  const [showTimingPopup, setShowTimingPopup] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // --- Fetch suggestions (MapTiler) ---
  const fetchSuggestions = async (query: string): Promise<Suggestion[]> => {
    const cleanedQuery = query.trim().replace(/\s+/g, " ")
    if (!cleanedQuery || cleanedQuery.length < 3) return []

    try {
      const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
        cleanedQuery,
      )}.json?key=${MAPTILER_KEY}&limit=5&autocomplete=true&country=US`

      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

      const data = await res.json()

      return data.features.map((f: any) => {
        const context = f.context || []
        const placeName = f.place_name || f.text || cleanedQuery

        const street = f.text || ""
        const houseNumber = f.address || ""

        // 🔧 extended fallback chain for city/town
        const city =
          context.find((c: any) => c.id.startsWith("place"))?.text ||
          context.find((c: any) => c.id.startsWith("locality"))?.text ||
          context.find((c: any) => c.id.startsWith("district"))?.text ||
          context.find((c: any) => c.id.startsWith("neighbourhood"))?.text ||
          context.find((c: any) => c.id.startsWith("county"))?.text ||
          ""

        const state = context.find((c: any) => c.id.startsWith("region"))?.text || ""

        const shortAddress = houseNumber ? `${houseNumber} ${street}` : street
        const displayName = [city, state].filter(Boolean).join(", ")

        return {
          displayName,
          shortAddress: shortAddress || placeName,
          fullAddress: placeName,
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
        }
      })
    } catch (err) {
      console.warn("[v0] MapTiler location search failed:", err)
      return []
    }
  }

  // --- Debounce helper ---
  const debounce = (func: Function, delay = 200) => {
    let timer: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timer)
      timer = setTimeout(() => func(...args), delay)
    }
  }
  const debouncedFetch = debounce(async (val: string) => {
    setSuggestions(await fetchSuggestions(val))
  }, 200)

  // --- Handlers ---
  const handlePickupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPickupLocation(value)
    setActiveInput("pickup")
    setPickupLatLng(null)
    debouncedFetch(value)
  }

  const handleDropoffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDropoffLocation(value)
    setActiveInput("dropoff")
    setDropoffLatLng(null)
    debouncedFetch(value)
  }

  const handleSwapAddresses = () => {
    const tempLocation = pickupLocation
    const tempLatLng = pickupLatLng

    setPickupLocation(dropoffLocation)
    setPickupLatLng(dropoffLatLng)
    setDropoffLocation(tempLocation)
    setDropoffLatLng(tempLatLng)
  }

  const handleSelect = (s: Suggestion, type?: "pickup" | "dropoff") => {
    const targetType = type || activeInput
    if (targetType === "pickup") {
      setPickupLocation(s.shortAddress) // ✅ only street/house number
      setPickupLatLng({ lat: s.lat, lng: s.lon })
    } else if (targetType === "dropoff") {
      setDropoffLocation(s.shortAddress) // ✅ only street/house number
      setDropoffLatLng({ lat: s.lat, lng: s.lon })
    }
    setSuggestions([])
    setActiveInput(null)
  }

  // --- Outside click closes suggestions ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setSuggestions([])
        setActiveInput(null)
        setShowTimingPopup(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // --- Confirm button ---
  const handleConfirm = () => {
    if (!pickupLatLng || !dropoffLatLng) return

    if (pickupTiming === "later") {
      // Navigate to book-later screen for scheduling
      onNavigate("book-later", {
        pickupLocation,
        dropoffLocation,
        pickupLatLng,
        dropoffLatLng,
      })
    } else {
      // Navigate to confirm-location for immediate rides
      onNavigate("confirm-location", {
        pickupLocation,
        dropoffLocation,
        pickupLatLng,
        dropoffLatLng,
        pickupTiming,
      })
    }
  }

  // --- Map pin fallback ---
  const handleMapPinSelect = () => {
    const locationType = !dropoffLocation ? "destination" : "pickup"
    onNavigate("map-location", {
      locationType,
      currentPickup: pickupLocation,
      currentDropoff: dropoffLocation,
    })
  }

  const showResults = activeInput && suggestions.length > 0

  return (
    <div ref={wrapperRef} className="bg-gray-100 min-h-screen max-h-screen overflow-hidden px-4 py-4 flex flex-col">
      <BackButton onClick={goBack} className="mb-4" />
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col pb-20"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Plan your ride</h1>

        <div className="flex gap-3 mb-6">
          {/* Pickup timing dropdown */}
          <button
            onClick={() => setShowTimingPopup(true)}
            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium"
          >
            <Clock className="h-4 w-4" />
            {pickupTiming === "now" ? "Pickup now" : "Pickup later"}
          </button>
        </div>

        <div className="mb-6 relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              {/* Pickup */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <Input
                    placeholder=""
                    value={pickupLocation}
                    onChange={handlePickupChange}
                    onFocus={() => setActiveInput("pickup")}
                    className="border-0 p-0 text-base font-medium focus-visible:ring-0 text-gray-900"
                  />
                </div>
              </div>

              {/* Dropoff */}
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-600 rounded-sm"></div>
                <div className="flex-1">
                  <Input
                    placeholder="Where to?"
                    value={dropoffLocation}
                    onChange={handleDropoffChange}
                    onFocus={() => setActiveInput("dropoff")}
                    className="border-0 p-0 text-base font-medium focus-visible:ring-0 text-gray-900"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSwapAddresses}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Swap pickup and destination"
            >
              <ArrowUpDown className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Suggestions */}
        {showResults && (
          <div className="flex-1 overflow-y-auto mb-4">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSelect(s)}
                className="w-full flex items-center gap-3 px-0 py-4 hover:bg-white text-left rounded-lg"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{s.shortAddress}</p>
                  <p className="text-sm text-gray-500 truncate">{s.displayName}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Map pin option */}
        <button
          onClick={handleMapPinSelect}
          className="w-full flex items-center gap-3 px-0 py-4 hover:bg-blue-50 text-left rounded-lg border-t border-gray-200 mt-4"
        >
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-blue-600">Set location on map</p>
            <p className="text-sm text-gray-500">Choose your location using the map</p>
          </div>
        </button>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!pickupLatLng || !dropoffLatLng}
          className="w-full bg-gray-200 text-gray-900 py-4 rounded-lg mt-4 disabled:bg-gray-300 disabled:text-gray-500 flex items-center justify-center gap-2 font-medium"
        >
          Done
        </button>
      </motion.div>

      <AnimatePresence>
        {showTimingPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
            onClick={() => setShowTimingPopup(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="bg-white rounded-t-3xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>

              <h3 className="text-xl font-semibold text-gray-900 mb-6">When do you need a ride?</h3>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => {
                    setPickupTiming("now")
                    setShowTimingPopup(false)
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    pickupTiming === "now" ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        pickupTiming === "now" ? "border-blue-600" : "border-gray-300"
                      }`}
                    >
                      <Clock className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Now</div>
                      <div className="text-sm text-gray-600">Request a ride, hop-in, and go</div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      pickupTiming === "now" ? "border-blue-600 bg-blue-600" : "border-gray-300"
                    }`}
                  >
                    {pickupTiming === "now" && <div className="w-full h-full rounded-full bg-white scale-50"></div>}
                  </div>
                </button>

                <button
                  onClick={() => {
                    setPickupTiming("later")
                    setShowTimingPopup(false)
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    pickupTiming === "later"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        pickupTiming === "later" ? "border-blue-600" : "border-gray-300"
                      }`}
                    >
                      <span className="text-lg">📅</span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Later</div>
                      <div className="text-sm text-gray-600">Reserve for extra peace of mind</div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      pickupTiming === "later" ? "border-blue-600 bg-blue-600" : "border-gray-300"
                    }`}
                  >
                    {pickupTiming === "later" && <div className="w-full h-full rounded-full bg-white scale-50"></div>}
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
