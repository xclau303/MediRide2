"use client"
import { motion } from "framer-motion"
import { Car, History, User, ChevronRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Screen } from "@/app/page"

interface DashboardScreenProps {
  onNavigate: (screen: Screen, data?: any) => void
  profileData: {
    firstName: string
    lastName: string
    ridesLeft: number
    completedRides: number
  }
  upcomingRides?: any[] // Added upcomingRides prop to receive real data
  onCancelRide?: (rideId: string) => void // Added cancel ride function prop
}

export function DashboardScreen({ onNavigate, profileData, upcomingRides = [], onCancelRide }: DashboardScreenProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800"
      case "Scheduled":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-gray-100 text-gray-800"
      case "Canceled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleTrackRide = (ride: any) => {
    const now = new Date()
    const rideTime = new Date(ride.createdAt + (ride.isScheduled ? 0 : 10 * 60 * 1000)) // 10 min for immediate rides

    if (ride.isScheduled) {
      // For scheduled rides, show reservation details
      onNavigate("reservation-details", { rideData: ride })
    } else {
      // For immediate rides, determine stage based on time elapsed
      const timeElapsed = now.getTime() - ride.createdAt

      if (timeElapsed < 10 * 60 * 1000) {
        // Less than 10 minutes
        onNavigate("waiting-for-ride", { rideData: ride })
      } else if (timeElapsed < 30 * 60 * 1000) {
        // Less than 30 minutes
        onNavigate("during-ride", { rideData: ride })
      } else {
        // Ride completed, show post-ride screen
        onNavigate("post-ride", { rideData: ride })
      }
    }
  }

  const handleCancelRide = (ride: any) => {
    const now = new Date()
    const rideTime = new Date(
      ride.isScheduled ? new Date(`${ride.date} ${ride.time}`).getTime() : ride.createdAt + 10 * 60 * 1000,
    )

    // Check if ride hasn't started yet
    if (now < rideTime) {
      if (confirm(`Are you sure you want to cancel this ride to ${ride.dropoff}?`)) {
        onCancelRide?.(ride.id)
      }
    } else {
      alert("This ride has already started and cannot be cancelled.")
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen max-h-screen overflow-hidden flex flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="px-3 py-0.5 text-center">
                <div className="text-lg font-bold text-blue-600">{profileData.ridesLeft}</div>
                <div className="text-gray-600 text-sm">Rides Left</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="px-3 py-0.5 text-center">
                <div className="text-lg font-bold text-blue-600">{profileData.completedRides}</div>
                <div className="text-gray-600 text-sm">Completed</div>
              </CardContent>
            </Card>
          </div>

          {/* Book New Ride */}
          <Card className="mb-6 cursor-pointer shadow-sm bg-white border-0" onClick={() => onNavigate("set-location")}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Book a New Ride</h2>
                  <p className="text-sm text-gray-600">Schedule your next medical transport.</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>

          {/* Ongoing Rides */}
          {upcomingRides.some((ride) => ride.status === "Confirmed" && !ride.isScheduled) && (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ongoing Rides</h2>
              {upcomingRides
                .filter((ride) => ride.status === "Confirmed" && !ride.isScheduled)
                .map((ride) => (
                  <Card key={ride.id} className="mb-4 shadow-sm bg-white border-0">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-base font-semibold text-gray-900">
                            {ride.date} • {ride.time}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800`}>
                            In Progress
                          </span>
                        </div>

                        <div className="text-gray-600 text-sm">
                          {ride.pickup} → {ride.dropoff}
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={() => handleTrackRide(ride)}
                            size="lg"
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 text-sm font-medium flex-1 rounded-xl"
                          >
                            Continue Ride
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </>
          )}

          {/* Upcoming Rides */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Rides</h2>
          {upcomingRides.filter(
            (ride) => ride.status !== "Completed" && !(ride.status === "Confirmed" && !ride.isScheduled),
          ).length === 0 ? (
            <Card className="mb-6 shadow-sm bg-white border-0">
              <CardContent className="p-4 text-center text-gray-500">No upcoming rides.</CardContent>
            </Card>
          ) : (
            upcomingRides
              .filter((ride) => ride.status !== "Completed" && !(ride.status === "Confirmed" && !ride.isScheduled))
              .map((ride) => (
                <Card key={ride.id} className="mb-4 shadow-sm bg-white border-0">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-base font-semibold text-gray-900">
                          {ride.date} • {ride.time}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                          {ride.status}
                        </span>
                      </div>

                      <div className="text-gray-600 text-sm">
                        {ride.pickup} → {ride.dropoff}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => handleTrackRide(ride)}
                          size="lg"
                          className="bg-blue-300 hover:bg-blue-400 text-white px-6 py-2 text-sm font-medium flex-1 rounded-xl"
                        >
                          Track
                        </Button>
                        <Button
                          onClick={() => handleCancelRide(ride)}
                          size="lg"
                          className="bg-red-300 hover:bg-red-400 text-white px-6 py-2 text-sm font-medium flex-1 rounded-xl"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around py-2">
          <button onClick={() => onNavigate("dashboard")} className="flex flex-col items-center text-blue-600">
            <Home className="h-6 w-6 mb-1" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => onNavigate("set-location")}
            className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
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
