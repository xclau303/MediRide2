interface RouteInfo {
  distance: number // in meters
  duration: number // in seconds
}

interface VehicleConfig {
  name: string
  baseRate: number // base fare
  perKmRate: number // rate per kilometer
  perMinRate: number // rate per minute
  surcharge?: number // additional surcharge (e.g., for accessibility)
  minimumFare: number // minimum charge
  arrivalTimeMinutes: number // how long until vehicle arrives
}

interface PricingResult {
  price: string // formatted price (e.g., "$15.50")
  arrivalTime: string // formatted arrival time
  eta: string // formatted ETA (arrival + travel time)
  awayTime: string // how far away the vehicle is
}

// Vehicle configurations
export const VEHICLE_TYPES: Record<string, VehicleConfig> = {
  standard: {
    name: "Standard Ride",
    baseRate: 3.50,
    perKmRate: 1.25,
    perMinRate: 0.30,
    minimumFare: 8.00,
    arrivalTimeMinutes: 4,
  },
  wheelchair: {
    name: "Wheelchair Van",
    baseRate: 5.00,
    perKmRate: 1.60,
    perMinRate: 0.40,
    surcharge: 5.00,
    minimumFare: 12.00,
    arrivalTimeMinutes: 6,
  },
}

/**
 * Calculate the fare for a ride based on route info and vehicle type
 */
export function calculateFare(routeInfo: RouteInfo | null, vehicleType: string): number {
  const config = VEHICLE_TYPES[vehicleType]
  if (!config || !routeInfo) {
    return config?.minimumFare || 8.00
  }

  const distanceKm = routeInfo.distance / 1000 // convert meters to km
  const durationMinutes = routeInfo.duration / 60 // convert seconds to minutes

  let fare = config.baseRate + 
             (distanceKm * config.perKmRate) + 
             (durationMinutes * config.perMinRate)

  // Add surcharge if applicable
  if (config.surcharge) {
    fare += config.surcharge
  }

  // Apply minimum fare
  return Math.max(fare, config.minimumFare)
}

/**
 * Format time for display (e.g., "11:44 PM")
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

/**
 * Get complete pricing information for a vehicle type
 */
export function getPricingInfo(routeInfo: RouteInfo | null, vehicleType: string): PricingResult {
  const config = VEHICLE_TYPES[vehicleType]
  if (!config) {
    throw new Error(`Unknown vehicle type: ${vehicleType}`)
  }

  const fare = calculateFare(routeInfo, vehicleType)
  const now = new Date()
  
  // Vehicle arrival time (when the car arrives to pick you up)
  const arrivalTime = new Date(now.getTime() + config.arrivalTimeMinutes * 60 * 1000)
  
  // ETA (arrival time + travel time)
  let eta = new Date(arrivalTime.getTime())
  if (routeInfo) {
    eta = new Date(arrivalTime.getTime() + routeInfo.duration * 1000)
  }

  return {
    price: `$${fare.toFixed(2)}`,
    arrivalTime: formatTime(arrivalTime),
    eta: formatTime(eta),
    awayTime: `${config.arrivalTimeMinutes} min away`,
  }
}

/**
 * Get all available vehicle types with their pricing info
 */
export function getAllVehiclePricing(routeInfo: RouteInfo | null): Array<{
  id: string
  config: VehicleConfig
  pricing: PricingResult
}> {
  return Object.entries(VEHICLE_TYPES).map(([id, config]) => ({
    id,
    config,
    pricing: getPricingInfo(routeInfo, id),
  }))
}

/**
 * Helper to format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

/**
 * Helper to format duration for display
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}
