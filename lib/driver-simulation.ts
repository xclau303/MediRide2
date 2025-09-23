import type { Driver, RideSimulation, VehicleType, SimulationConfig } from "@/types/driver"

// Generate random driver names - moved inline to fix import issue
const FIRST_NAMES = [
  "Alex",
  "Jordan",
  "Taylor",
  "Casey",
  "Morgan",
  "Riley",
  "Avery",
  "Quinn",
  "Sam",
  "Blake",
  "Cameron",
  "Drew",
  "Emery",
  "Finley",
  "Harper",
  "Hayden",
  "Jamie",
  "Kendall",
  "Logan",
  "Marley",
  "Parker",
  "Peyton",
  "Reese",
  "Sage",
  "Skyler",
  "Tanner",
  "Teagan",
  "Tyler",
  "Wren",
  "Zion",
]

const LAST_NAMES = [
  "Anderson",
  "Brown",
  "Davis",
  "Garcia",
  "Johnson",
  "Jones",
  "Martinez",
  "Miller",
  "Moore",
  "Rodriguez",
  "Smith",
  "Taylor",
  "Thomas",
  "Thompson",
  "White",
  "Williams",
  "Wilson",
  "Clark",
  "Lewis",
  "Lee",
  "Walker",
  "Hall",
  "Allen",
  "Young",
  "King",
  "Wright",
  "Lopez",
  "Hill",
  "Scott",
  "Green",
]

function generateDriverName(): { firstName: string; lastName: string } {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  return { firstName, lastName }
}

function generateInitialsAvatar(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`
}

// Simulation configuration with accelerated timing
const CONFIG: SimulationConfig = {
  searchDuration: 5000, // 5 seconds
  waitingDuration: 30000, // 30 seconds (shows as 8-10 min ETA)
  rideDuration: 30000, // 30 seconds (shows actual trip duration)
  speedMultiplier: 16, // 16x speed for demo
  maxSearchAttempts: 3,
}

// Vehicle configurations
const STANDARD_VEHICLES = [
  { make: "Honda", model: "Civic" },
  { make: "Toyota", model: "Camry" },
  { make: "Honda", model: "Accord" },
  { make: "Nissan", model: "Altima" },
  { make: "Toyota", model: "Corolla" },
  { make: "Hyundai", model: "Elantra" },
  { make: "Ford", model: "Focus" },
  { make: "Chevrolet", model: "Cruze" },
]

const ACCESSIBLE_VEHICLES = [
  { make: "Honda", model: "Odyssey" },
  { make: "Toyota", model: "Sienna" },
  { make: "Chrysler", model: "Pacifica" },
  { make: "Ford", model: "Transit Connect" },
]

const VEHICLE_COLORS = ["Silver", "White", "Black", "Gray", "Blue", "Red", "Green", "Brown"]

// Generate random location within radius
function generateRandomLocation(center: { lat: number; lng: number }, radiusMiles = 1.5): { lat: number; lng: number } {
  // Convert miles to degrees (approximate)
  const radiusInDegrees = radiusMiles / 69 // 1 degree ≈ 69 miles

  // Random angle and distance
  const angle = Math.random() * 2 * Math.PI
  const distance = Math.random() * radiusInDegrees

  return {
    lat: center.lat + distance * Math.cos(angle),
    lng: center.lng + distance * Math.sin(angle),
  }
}

// Generate random license plate
function generateLicensePlate(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ" // Exclude I and O
  const numbers = "0123456789"

  // Format: 3 letters + 3 numbers (like ABC123)
  let plate = ""
  for (let i = 0; i < 3; i++) {
    plate += letters[Math.floor(Math.random() * letters.length)]
  }
  for (let i = 0; i < 3; i++) {
    plate += numbers[Math.floor(Math.random() * numbers.length)]
  }

  return plate
}

// Generate driver profile
export function generateDriver(
  pickupLocation: { lat: number; lng: number },
  vehicleType: VehicleType = "standard",
): Driver {
  const { firstName, lastName } = generateDriverName()
  const vehicles = vehicleType === "accessible" ? ACCESSIBLE_VEHICLES : STANDARD_VEHICLES
  const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)]
  const color = VEHICLE_COLORS[Math.floor(Math.random() * VEHICLE_COLORS.length)]

  // Generate rating between 4.5 and 5.0
  const rating = Math.round((4.5 + Math.random() * 0.5) * 10) / 10

  // Generate random starting location around pickup
  const startLocation = generateRandomLocation(pickupLocation, 2) // Within 2 miles

  return {
    id: `driver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: `${firstName} ${lastName}`,
    avatar: generateInitialsAvatar(firstName, lastName),
    rating,
    vehicle: {
      make: vehicle.make,
      model: vehicle.model,
      color,
      plate: generateLicensePlate(),
      isAccessible: vehicleType === "accessible",
    },
    currentLocation: startLocation,
    eta: 0, // Will be calculated based on distance
  }
}

// Calculate ETA in seconds based on distance and average speed
function calculateETA(from: { lat: number; lng: number }, to: { lat: number; lng: number }, avgSpeedMph = 30): number {
  // Haversine formula for distance calculation
  const R = 3959 // Earth's radius in miles
  const dLat = ((to.lat - from.lat) * Math.PI) / 180
  const dLng = ((to.lng - from.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) * Math.cos((to.lat * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in miles

  // Convert to time in seconds
  const timeHours = distance / avgSpeedMph
  return Math.round(timeHours * 3600) // Convert to seconds
}

// ORS API configuration
const ORS_API_KEY =
  process.env.ORS_API_KEY ||
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjZmN2ZjNjg5NzgyYTRmZWE4NDRhNzhiOTBmMTc0YjNkIiwiaCI6Im11cm11cjY0In0="
const ORS_BASE_URL = "https://api.openrouteservice.org/v2/directions/driving-car"

// Decode polyline from ORS response
function decodePolyline(encoded: string): [number, number][] {
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

// Fetch route using ORS API
export async function fetchRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): Promise<[number, number][]> {
  try {
    const requestBody = {
      coordinates: [
        [from.lng, from.lat], // ORS uses [lng, lat] format
        [to.lng, to.lat],
      ],
    }

    const response = await fetch(ORS_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: ORS_API_KEY,
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
      return decodePolyline(route.geometry)
    } else {
      throw new Error("No route returned from ORS")
    }
  } catch (error) {
    console.warn("[DriverSimulation] Failed to fetch route from ORS:", error)
    // Fallback to straight line
    return [
      [from.lat, from.lng],
      [to.lat, to.lng],
    ]
  }
}

// Simulate driver search
export async function simulateDriverSearch(
  pickupLocation: { lat: number; lng: number },
  vehicleType: VehicleType = "standard",
  onSearchUpdate?: (message: string) => void,
): Promise<Driver | null> {
  return new Promise((resolve) => {
    onSearchUpdate?.("Finding your driver...")

    setTimeout(() => {
      // 90% success rate for finding a driver
      if (Math.random() < 0.9) {
        const driver = generateDriver(pickupLocation, vehicleType)
        driver.eta = calculateETA(driver.currentLocation, pickupLocation, 30)
        resolve(driver)
      } else {
        resolve(null) // No driver found
      }
    }, CONFIG.searchDuration)
  })
}

// Create ride simulation
export async function createRideSimulation(
  pickupLocation: { lat: number; lng: number },
  dropoffLocation: { lat: number; lng: number },
  vehicleType: VehicleType = "standard",
): Promise<RideSimulation> {
  const driver = await simulateDriverSearch(pickupLocation, vehicleType)

  if (!driver) {
    return {
      status: "searching",
      approach_route: [],
      trip_route: [],
      progress: 0,
      searchAttempts: 1,
    }
  }

  // Fetch approach route (driver to pickup)
  const approachRoute = await fetchRoute(driver.currentLocation, pickupLocation)

  // Fetch trip route (pickup to dropoff)
  const tripRoute = await fetchRoute(pickupLocation, dropoffLocation)

  return {
    status: "approaching",
    driver,
    approach_route: approachRoute,
    trip_route: tripRoute,
    progress: 0,
  }
}

// Simulate driver movement along route
export function simulateDriverMovement(
  route: [number, number][],
  duration: number,
  onPositionUpdate: (position: { lat: number; lng: number }, progress: number) => void,
): () => void {
  if (route.length < 2) return () => {}

  const totalPoints = route.length - 1
  const intervalMs = duration / totalPoints // Time between each point
  let currentIndex = 0

  const interval = setInterval(() => {
    if (currentIndex >= totalPoints) {
      clearInterval(interval)
      return
    }

    const [lat, lng] = route[currentIndex]
    const progress = currentIndex / totalPoints

    onPositionUpdate({ lat, lng }, progress)
    currentIndex++
  }, intervalMs)

  return () => clearInterval(interval)
}

// Format ETA for display
export function formatETA(seconds: number): string {
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes > 0 ? remainingMinutes + "m" : ""}`
}

// Format arrival time for display (shows accelerated demo time but displays real ETA)
export function formatArrivalTime(etaSeconds: number): { displayETA: string; demoETA: string; awayTime: string } {
  // For demo, show realistic times but simulation runs 16x faster
  const displayMinutes = Math.ceil(etaSeconds / 60)
  const demoMinutes = Math.ceil(displayMinutes / CONFIG.speedMultiplier)

  return {
    displayETA: `${displayMinutes} min`,
    demoETA: `${demoMinutes} min`,
    awayTime: `${demoMinutes} min away`,
  }
}

// Get simulation config
export function getSimulationConfig(): SimulationConfig {
  return CONFIG
}
