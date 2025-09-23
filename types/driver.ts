export interface Driver {
  id: string
  name: string
  avatar: string // initials-based
  rating: number
  vehicle: {
    make: string
    model: string
    color: string
    plate: string
    isAccessible: boolean
  }
  currentLocation: { lat: number; lng: number }
  eta: number // seconds
}

export interface RideSimulation {
  status: "searching" | "approaching" | "in_progress" | "completed"
  driver?: Driver
  approach_route: [number, number][]
  trip_route: [number, number][]
  progress: number // 0-1
  searchAttempts: number
}

export type VehicleType = "standard" | "accessible"
