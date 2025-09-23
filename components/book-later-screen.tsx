"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Clock, Home, Car, History, User } from "lucide-react"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"
import { cn } from "@/lib/utils"

interface BookLaterScreenProps {
  onNavigate: (screen: Screen, data?: any) => void
  goBack: () => void
  pickupAddress?: string
  destinationAddress?: string
  pickupLatLng?: { lat: number; lng: number }
  dropoffLatLng?: { lat: number; lng: number }
}

export function BookLaterScreen({
  onNavigate,
  goBack,
  pickupAddress,
  destinationAddress,
  pickupLatLng,
  dropoffLatLng,
}: BookLaterScreenProps) {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState<string>("")
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const getCurrentTimeInMinutes = () => {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes()
  }

  const generateTimeSlots = (selectedDate?: Date) => {
    const slots = []
    const currentTimeInMinutes = getCurrentTimeInMinutes()

    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 30) {
        const slotTimeInMinutes = i * 60 + j

        // If selected date is today, only show future time slots
        if (selectedDate && isToday(selectedDate) && slotTimeInMinutes <= currentTimeInMinutes) {
          continue
        }

        const hour = i % 12 === 0 ? 12 : i % 12
        const minute = j === 0 ? "00" : "30"
        const ampm = i < 12 ? "AM" : "PM"
        slots.push(`${hour}:${minute} ${ampm}`)
      }
    }
    return slots
  }

  useEffect(() => {
    if (date) {
      const slots = generateTimeSlots(date)
      setAvailableTimeSlots(slots)

      // Reset time selection if current time is no longer valid
      if (time && !slots.includes(time)) {
        setTime("")
      }
    } else {
      setAvailableTimeSlots([])
      setTime("")
    }
  }, [date, time])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleConfirmBooking = () => {
    if (!date || !time) {
      alert("Please select both a date and a time.")
      return
    }

    onNavigate("confirm-location", {
      pickupLocation: pickupAddress,
      dropoffLocation: destinationAddress,
      pickupLatLng: pickupLatLng,
      dropoffLatLng: dropoffLatLng,
      scheduledDate: formatDate(date),
      scheduledTime: time,
      isScheduled: true,
    })
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 py-4 pb-20">
        <BackButton onClick={goBack} className="mb-4" />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Schedule your ride</h1>

          {(pickupAddress || destinationAddress) && (
            <div className="space-y-3 mb-8">
              {pickupAddress && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 text-base">{pickupAddress}</span>
                </div>
              )}
              {destinationAddress && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700 text-base">{destinationAddress}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-6 mb-8">
            {/* Date Picker */}
            <div>
              <p className="text-lg font-medium text-gray-900 mb-3">
                Select Date <span className="text-red-500">*</span>
              </p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-12 text-base",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    {date ? formatDate(date) : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={isPastDate}
                    fromDate={new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Picker */}
            <div>
              <p className="text-lg font-medium text-gray-900 mb-3">
                Select Time <span className="text-red-500">*</span>
              </p>
              <Select value={time} onValueChange={setTime} disabled={!date}>
                <SelectTrigger className="h-12 text-base">
                  <Clock className="mr-2 h-5 w-5 text-gray-600" />
                  <SelectValue placeholder={date ? "Select a time" : "Select a date first"} />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {availableTimeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {date && isToday(date) && (
                <p className="text-sm text-gray-500 mt-2">Only future time slots are available for today</p>
              )}
            </div>
          </div>

          <Button
            onClick={handleConfirmBooking}
            disabled={!date || !time}
            className="w-full h-12 bg-black text-white rounded-full text-base font-medium disabled:bg-gray-300 disabled:text-gray-500"
          >
            Confirm Booking
          </Button>
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
