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
  distance: number // meters from pickup
}

export interface RideSimulation {
  status: 'searching' | 'driver_assigned' | 'approaching' | 'arrived' | 'in_progress' | 'completed'
  driver?: Driver
  approachRoute: [number, number][]
  tripRoute: [number, number][]
  progress: number // 0-1 for route completion
  searchAttempts: number
  estimatedPickupTime: number // seconds
  estimatedTripTime: number // seconds
}

export interface VehiclePool {
  standard: {
    makes: string[]
    models: { [key: string]: string[] }
    colors: string[]
  }
  accessible: {
    makes: string[]
    models: { [key: string]: string[] }
    colors: string[]
  }
}

export interface DriverName {
  first: string
  last: string
}

// Additional helpful types for the app
export interface RouteInfo {
  distance: number // meters
  duration: number // seconds
  polyline?: string
}

export interface LocationCoords {
  lat: number
  lng: number
}

export interface RideRequest {
  id: string
  pickupLocation: string
  dropoffLocation: string
  pickupLatLng: LocationCoords
  dropoffLatLng: LocationCoords
  scheduledDate?: string
  scheduledTime?: string
  isScheduled: boolean
  vehicleType?: string
  isAccessible?: boolean
  createdAt: number
}