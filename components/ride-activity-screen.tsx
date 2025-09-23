"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { MapPin, Clock, Home, Car, History, User, Calendar, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface RideActivityScreenProps {
  onNavigate: (screen: Screen, data?: any) => void
  goBack: () => void
}

export function RideActivityScreen({ onNavigate, goBack }: RideActivityScreenProps) {
  const [selectedRide, setSelectedRide] = useState<any>(null)
  const [showRideDetails, setShowRideDetails] = useState(false)

  const allRides = [
    {
      id: 1,
      title: "Doctor's Visit",
      pickupAddress: "123 Main St, Anytown",
      dropoffAddress: "City Hospital",
      dateTime: new Date(new Date().getTime() + 30 * 60 * 1000), // 30 minutes from now
      status: "Confirmed",
      icon: "🏥",
      type: "upcoming",
      driver: { name: "Alice Smith", vehicle: "Toyota Camry", plate: "ABC 123" },
    },
    {
      id: 2,
      title: "Pharmacy Pick-up",
      pickupAddress: "Home",
      dropoffAddress: "Local Pharmacy",
      dateTime: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      status: "Scheduled",
      icon: "💊",
      type: "upcoming",
      driver: null,
    },
    {
      id: 3,
      title: "Follow-up Checkup",
      pickupAddress: "Home",
      dropoffAddress: "Specialist Clinic",
      dateTime: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      status: "Completed",
      icon: "🩺",
      type: "past",
      driver: { name: "Bob Johnson", vehicle: "Honda Civic", plate: "DEF 456" },
    },
    {
      id: 4,
      title: "Dental Check-up",
      pickupAddress: "Work",
      dropoffAddress: "Dental Office",
      dateTime: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      status: "Canceled",
      icon: "🦷",
      type: "past",
      driver: null,
    },
  ]

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const handleRideClick = (ride: any) => {
    setSelectedRide(ride)
    setShowRideDetails(true)
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between shadow-sm">
        <BackButton onClick={goBack} />
        <h1 className="text-xl font-bold text-gray-900">Ride Activity</h1>
        <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Tabs for Past and Upcoming Rides */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {allRides.filter((ride) => ride.type === "upcoming").length === 0 ? (
                <p className="text-center text-gray-500 py-8">No upcoming rides found.</p>
              ) : (
                <div className="space-y-4">
                  {allRides
                    .filter((ride) => ride.type === "upcoming")
                    .map((ride) => (
                      <Card
                        key={ride.id}
                        className="cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                        onClick={() => handleRideClick(ride)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(ride.dateTime)}</span>
                              <Clock className="h-4 w-4 ml-2" />
                              <span>{formatTime(ride.dateTime)}</span>
                            </div>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}
                            >
                              {ride.status}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span>Pickup: {ride.pickupAddress}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span>Dropoff: {ride.dropoffAddress}</span>
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {allRides.filter((ride) => ride.type === "past").length === 0 ? (
                <p className="text-center text-gray-500 py-8">No past rides found.</p>
              ) : (
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Completed Rides</h3>
                  </div>
                  {allRides
                    .filter((ride) => ride.type === "past" && ride.status === "Completed")
                    .map((ride) => (
                      <Card
                        key={ride.id}
                        className="cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                        onClick={() => handleRideClick(ride)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(ride.dateTime)}</span>
                              <Clock className="h-4 w-4 ml-2" />
                              <span>{formatTime(ride.dateTime)}</span>
                            </div>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}
                            >
                              {ride.status}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span>Pickup: {ride.pickupAddress}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span>Dropoff: {ride.dropoffAddress}</span>
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  {allRides.filter((ride) => ride.type === "past" && ride.status !== "Completed").length > 0 && (
                    <>
                      <div className="mt-6 mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Other Past Rides</h3>
                      </div>
                      {allRides
                        .filter((ride) => ride.type === "past" && ride.status !== "Completed")
                        .map((ride) => (
                          <Card
                            key={ride.id}
                            className="cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                            onClick={() => handleRideClick(ride)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(ride.dateTime)}</span>
                                  <Clock className="h-4 w-4 ml-2" />
                                  <span>{formatTime(ride.dateTime)}</span>
                                </div>
                                <span
                                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}
                                >
                                  {ride.status}
                                </span>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <span>Pickup: {ride.pickupAddress}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <span>Dropoff: {ride.dropoffAddress}</span>
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <Dialog open={showRideDetails} onOpenChange={setShowRideDetails}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Ride Details</DialogTitle>
          </DialogHeader>
          {selectedRide && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(selectedRide.dateTime)}</span>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>{formatTime(selectedRide.dateTime)}</span>
                </div>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRide.status)}`}
                >
                  {selectedRide.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>Pickup: {selectedRide.pickupAddress}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>Dropoff: {selectedRide.dropoffAddress}</span>
                </p>
                {selectedRide.driver &&
                  (selectedRide.status === "Confirmed" || selectedRide.status === "Completed") && (
                    <p className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>
                        Driver: {selectedRide.driver.name} ({selectedRide.driver.vehicle}, {selectedRide.driver.plate})
                      </span>
                    </p>
                  )}
                {selectedRide.status === "Scheduled" && (
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>Driver: Not yet assigned</span>
                  </p>
                )}
              </div>

              {selectedRide.type === "upcoming" && (
                <div className="flex gap-2 pt-4">
                  {selectedRide.status === "Confirmed" && (
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      Track Ride
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Reschedule
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1">
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around py-2">
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
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
          <button onClick={() => onNavigate("ride-activity")} className="flex flex-col items-center text-blue-600">
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
